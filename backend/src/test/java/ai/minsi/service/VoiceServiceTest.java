package ai.minsi.service;

import ai.minsi.client.VoiceTranscriptionClient;
import ai.minsi.client.VoiceTranscriptionResult;
import ai.minsi.client.RealtimeVoiceSession;
import ai.minsi.dto.voice.VoiceSessionResponse;
import ai.minsi.dto.voice.VoiceTranscribeRequest;
import ai.minsi.dto.voice.VoiceTranscribeResponse;
import ai.minsi.security.AuthenticatedUser;
import ai.minsi.util.HashUtils;
import ai.minsi.util.SessionTokenGenerator;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class VoiceServiceTest {

    private static final String RAW_VOICE_TOKEN = "raw-voice-token";
    private static final String HASH_SALT = "test-salt";

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void createSessionStoresOnlyHashedVoiceToken() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        HashOperations<String, Object, Object> hashOperations = mock(HashOperations.class);
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);
        HashUtils hashUtils = new HashUtils(HASH_SALT);
        VoiceService voiceService = newVoiceService(redisTemplate, hashUtils, input -> new VoiceTranscriptionResult("mock-result"));

        VoiceSessionResponse response = voiceService.createSession(currentUser());

        String expectedHash = hashUtils.sha256WithConfiguredSalt(RAW_VOICE_TOKEN);
        ArgumentCaptor<Map> fieldsCaptor = ArgumentCaptor.forClass(Map.class);
        verify(hashOperations).putAll(eq("voice:session:" + expectedHash), fieldsCaptor.capture());
        verify(redisTemplate).expire("voice:session:" + expectedHash, Duration.ofMinutes(30));
        assertThat(fieldsCaptor.getValue())
                .containsKeys("user_id", "expires_at")
                .doesNotContainValue(RAW_VOICE_TOKEN);
        assertThat(response.voiceToken()).isEqualTo(RAW_VOICE_TOKEN);
        assertThat(response.expiresInSeconds()).isEqualTo(1800);
        assertThat(response.realtimeClientSecret()).isEqualTo("ephemeral-client-secret");
        assertThat(response.realtimeModel()).isEqualTo("gpt-realtime-2.1-mini");
        assertThat(fieldsCaptor.getValue()).doesNotContainValue("ephemeral-client-secret");
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void createSessionCanSkipRealtimeSecret() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        HashOperations<String, Object, Object> hashOperations = mock(HashOperations.class);
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);
        HashUtils hashUtils = new HashUtils(HASH_SALT);
        VoiceService voiceService = newVoiceService(redisTemplate, hashUtils, input -> new VoiceTranscriptionResult("mock-result"));

        VoiceSessionResponse response = voiceService.createSession(currentUser(), false);

        String expectedHash = hashUtils.sha256WithConfiguredSalt(RAW_VOICE_TOKEN);
        ArgumentCaptor<Map> fieldsCaptor = ArgumentCaptor.forClass(Map.class);
        verify(hashOperations).putAll(eq("voice:session:" + expectedHash), fieldsCaptor.capture());
        assertThat(response.voiceToken()).isEqualTo(RAW_VOICE_TOKEN);
        assertThat(response.realtimeClientSecret()).isBlank();
        assertThat(response.realtimeModel()).isBlank();
        assertThat(fieldsCaptor.getValue()).doesNotContainValue(RAW_VOICE_TOKEN);
    }

    @Test
    void transcribeDoesNotWriteReturnedTextToRedis() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        HashOperations<String, Object, Object> hashOperations = mock(HashOperations.class);
        ValueOperations<String, String> valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenReturn(1L);
        HashUtils hashUtils = new HashUtils(HASH_SALT);
        String expectedHash = hashUtils.sha256WithConfiguredSalt(RAW_VOICE_TOKEN);
        when(hashOperations.get("voice:session:" + expectedHash, "user_id")).thenReturn("7");
        VoiceService voiceService = newVoiceService(redisTemplate, hashUtils, input -> new VoiceTranscriptionResult("mock-result"));

        VoiceTranscribeResponse response = voiceService.transcribe(
                currentUser(),
                new VoiceTranscribeRequest(RAW_VOICE_TOKEN, "mock-audio-frame", "application/mock-audio")
        );

        assertThat(response.text()).isEqualTo("mock-result");
        verify(hashOperations, never()).putAll(anyString(), anyMap());
    }

    private VoiceService newVoiceService(
            StringRedisTemplate redisTemplate,
            HashUtils hashUtils,
            VoiceTranscriptionClient transcriptionClient
    ) {
        return new VoiceService(
                redisTemplate,
                hashUtils,
                fixedTokenGenerator(),
                safetyIdentifier -> new RealtimeVoiceSession("ephemeral-client-secret", 2_000_000_000L, "gpt-realtime-2.1-mini"),
                transcriptionClient,
                new RateLimitService(redisTemplate)
        );
    }

    private SessionTokenGenerator fixedTokenGenerator() {
        return new SessionTokenGenerator() {
            @Override
            public String generate() {
                return RAW_VOICE_TOKEN;
            }
        };
    }

    private AuthenticatedUser currentUser() {
        return new AuthenticatedUser(7L, "child@example.com", "email", "邮箱");
    }
}
