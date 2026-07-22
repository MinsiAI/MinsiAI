package ai.minsi.service;

import ai.minsi.client.VoiceAudioInput;
import ai.minsi.client.RealtimeVoiceClient;
import ai.minsi.client.RealtimeVoiceSession;
import ai.minsi.client.VoiceTranscriptionClient;
import ai.minsi.client.VoiceTranscriptionResult;
import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.dto.voice.VoiceSessionResponse;
import ai.minsi.dto.voice.VoiceTranscribeRequest;
import ai.minsi.dto.voice.VoiceTranscribeResponse;
import ai.minsi.logging.SanitizedLogger;
import ai.minsi.security.AuthenticatedUser;
import ai.minsi.util.HashUtils;
import ai.minsi.util.SessionTokenGenerator;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@Service
public class VoiceService {

    private static final SanitizedLogger LOGGER = SanitizedLogger.getLogger(VoiceService.class);

    public static final Duration VOICE_SESSION_TTL = Duration.ofMinutes(30);

    private static final String TRANSCRIBE_ENDPOINT = "/api/voice/transcribe";
    private static final long MAX_AUDIO_BYTES = 8L * 1024L * 1024L;
    private static final String USER_ID_FIELD = "user_id";
    private static final String EXPIRES_AT_FIELD = "expires_at";

    private final StringRedisTemplate redisTemplate;
    private final HashUtils hashUtils;
    private final SessionTokenGenerator tokenGenerator;
    private final RealtimeVoiceClient realtimeVoiceClient;
    private final VoiceTranscriptionClient transcriptionClient;
    private final RateLimitService rateLimitService;

    public VoiceService(
            StringRedisTemplate redisTemplate,
            HashUtils hashUtils,
            SessionTokenGenerator tokenGenerator,
            RealtimeVoiceClient realtimeVoiceClient,
            VoiceTranscriptionClient transcriptionClient,
            RateLimitService rateLimitService
    ) {
        this.redisTemplate = redisTemplate;
        this.hashUtils = hashUtils;
        this.tokenGenerator = tokenGenerator;
        this.realtimeVoiceClient = realtimeVoiceClient;
        this.transcriptionClient = transcriptionClient;
        this.rateLimitService = rateLimitService;
    }

    public VoiceSessionResponse createSession(AuthenticatedUser currentUser) {
        return createSession(currentUser, true);
    }

    public VoiceSessionResponse createSession(AuthenticatedUser currentUser, boolean includeRealtime) {
        requireUser(currentUser);

        String userHash = hashUtils.sha256WithConfiguredSalt(String.valueOf(currentUser.userId()));
        RealtimeVoiceSession realtimeSession = includeRealtime
                ? realtimeVoiceClient.createClientSecret(userHash)
                : RealtimeVoiceSession.empty();

        String voiceToken = tokenGenerator.generate();
        String tokenHash = hashUtils.sha256WithConfiguredSalt(voiceToken);
        Instant expiresAt = Instant.now().plus(VOICE_SESSION_TTL);
        String key = voiceSessionKey(tokenHash);

        redisTemplate.opsForHash().putAll(key, Map.of(
                USER_ID_FIELD, String.valueOf(currentUser.userId()),
                EXPIRES_AT_FIELD, expiresAt.toString()
        ));
        redisTemplate.expire(key, VOICE_SESSION_TTL);

        return new VoiceSessionResponse(
                voiceToken,
                VOICE_SESSION_TTL.toSeconds(),
                realtimeSession.clientSecret(),
                realtimeSession.clientSecretExpiresAt(),
                realtimeSession.model()
        );
    }

    public VoiceTranscribeResponse transcribe(AuthenticatedUser currentUser, VoiceTranscribeRequest request) {
        requireUser(currentUser);
        if (request == null || request.voiceToken().isBlank() || request.audioSample().isBlank()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        return transcribe(currentUser, request.voiceToken(), VoiceAudioInput.fromSample(
                request.audioSample(),
                request.mimeType()
        ));
    }

    public VoiceTranscribeResponse transcribe(AuthenticatedUser currentUser, String voiceToken, MultipartFile audioFile) {
        requireUser(currentUser);
        if (voiceToken == null || voiceToken.isBlank() || audioFile == null || audioFile.isEmpty() || audioFile.getSize() > MAX_AUDIO_BYTES) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        try {
            return transcribe(currentUser, voiceToken.trim(), VoiceAudioInput.fromBytes(
                    audioFile.getBytes(),
                    audioFile.getContentType(),
                    audioFile.getOriginalFilename()
            ));
        } catch (IOException exception) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
    }

    private VoiceTranscribeResponse transcribe(AuthenticatedUser currentUser, String voiceToken, VoiceAudioInput audioInput) {
        String userHash = hashUtils.sha256WithConfiguredSalt(String.valueOf(currentUser.userId()));
        rateLimitService.checkAllowed("user", userHash, TRANSCRIBE_ENDPOINT, 10, Duration.ofMinutes(1));
        requireMatchingVoiceSession(currentUser.userId(), voiceToken);

        VoiceTranscriptionResult result;
        try {
            result = transcriptionClient.transcribe(audioInput);
        } catch (BusinessException exception) {
            if (exception.getErrorCode() == ErrorCode.VOICE_NOT_CLEAR) {
                logTranscriptionNotClear();
                throw exception;
            }
            if (exception.getErrorCode() == ErrorCode.BAD_REQUEST) {
                throw exception;
            }
            LOGGER.warn("voice_stt_unavailable", Map.of(
                    "endpoint", TRANSCRIBE_ENDPOINT,
                    "error_code", ErrorCode.VOICE_UNAVAILABLE.getCode()
            ));
            throw new BusinessException(ErrorCode.VOICE_UNAVAILABLE);
        } catch (RuntimeException exception) {
            LOGGER.warn("voice_stt_unavailable", Map.of(
                    "endpoint", TRANSCRIBE_ENDPOINT,
                    "error_code", ErrorCode.VOICE_UNAVAILABLE.getCode()
            ));
            throw new BusinessException(ErrorCode.VOICE_UNAVAILABLE);
        }

        if (result.text().isBlank()) {
            logTranscriptionNotClear();
            throw new BusinessException(ErrorCode.VOICE_NOT_CLEAR);
        }

        return new VoiceTranscribeResponse(result.text());
    }

    private void logTranscriptionNotClear() {
        LOGGER.warn("voice_stt_not_clear", Map.of(
                "endpoint", TRANSCRIBE_ENDPOINT,
                "error_code", ErrorCode.VOICE_NOT_CLEAR.getCode()
        ));
    }

    private void requireMatchingVoiceSession(Long userId, String voiceToken) {
        String tokenHash = hashUtils.sha256WithConfiguredSalt(voiceToken);
        String key = voiceSessionKey(tokenHash);
        Object storedUserIdValue = redisTemplate.opsForHash().get(key, USER_ID_FIELD);
        if (storedUserIdValue == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        Long storedUserId = parseUserId(storedUserIdValue);
        if (storedUserId == null) {
            redisTemplate.delete(key);
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        if (!storedUserId.equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private void requireUser(AuthenticatedUser currentUser) {
        if (currentUser == null || currentUser.userId() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
    }

    private Long parseUserId(Object userIdValue) {
        try {
            return Long.valueOf(String.valueOf(userIdValue));
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String voiceSessionKey(String tokenHash) {
        return "voice:session:" + tokenHash;
    }
}
