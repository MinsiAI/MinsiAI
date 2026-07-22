package ai.minsi.service;

import ai.minsi.client.AiClient;
import ai.minsi.client.AiPrompt;
import ai.minsi.client.AiResult;
import ai.minsi.client.SafetyClassifier;
import ai.minsi.client.VoiceSpeechClient;
import ai.minsi.client.VoiceSpeechResult;
import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.config.ChatConstants;
import ai.minsi.dto.chat.ChatRequest;
import ai.minsi.dto.chat.ChatResponse;
import ai.minsi.dto.chat.ChatTurn;
import ai.minsi.dto.chat.SafetyLevel;
import ai.minsi.logging.SanitizedLogger;
import ai.minsi.security.AuthenticatedUser;
import ai.minsi.util.HashUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class ChatService {

    private static final SanitizedLogger LOGGER = SanitizedLogger.getLogger(ChatService.class);
    private static final String CHAT_ENDPOINT = "/api/chat";

    private final AiClient aiClient;
    private final RateLimitService rateLimitService;
    private final HashUtils hashUtils;
    private final SafetyEventService safetyEventService;
    private final VoiceSpeechClient voiceSpeechClient;
    private final ObjectMapper objectMapper;

    public ChatService(
            AiClient aiClient,
            RateLimitService rateLimitService,
            HashUtils hashUtils,
            SafetyEventService safetyEventService,
            VoiceSpeechClient voiceSpeechClient,
            ObjectMapper objectMapper
    ) {
        this.aiClient = aiClient;
        this.rateLimitService = rateLimitService;
        this.hashUtils = hashUtils;
        this.safetyEventService = safetyEventService;
        this.voiceSpeechClient = voiceSpeechClient;
        this.objectMapper = objectMapper;
    }

    public ChatResponse chat(AuthenticatedUser currentUser, ChatRequest request) {
        PreparedChat preparedChat = prepareChat(currentUser, request);
        boolean voiceMode = preparedChat.voiceMode();
        boolean fixedSafetyResponse = preparedChat.safetyAssessment().requiresFixedResponse();
        AiResult aiResult = fixedSafetyResponse
                ? ChatRuntimePolicy.safetyResult(preparedChat.safetyAssessment(), voiceMode)
                : aiClient.chat(preparedChat.aiPrompt());
        if (!fixedSafetyResponse && aiResult.safetyLevel() == SafetyLevel.CRISIS) {
            aiResult = ChatRuntimePolicy.crisisResult(voiceMode);
        } else if (aiResult.safetyLevel() != SafetyLevel.CRISIS) {
            aiResult = new AiResult(
                    ChatRuntimePolicy.limitReply(aiResult.text(), voiceMode),
                    aiResult.safetyLevel(),
                    aiResult.suggestedActions()
            );
        }
        if (aiResult.safetyLevel() == SafetyLevel.CRISIS) {
            safetyEventService.recordChatCrisis(currentUser.userId());
        }

        VoiceSpeechResult speechResult = VoiceSpeechResult.empty();
        if (voiceMode) {
            speechResult = synthesizeAudio(aiResult.text());
            if (!speechResult.hasAudio()) {
                throw new BusinessException(ErrorCode.VOICE_UNAVAILABLE);
            }
        }

        return new ChatResponse(
                aiResult.text(),
                aiResult.safetyLevel(),
                aiResult.suggestedActions(),
                speechResult.contentType(),
                speechResult.hasAudio() ? Base64.getEncoder().encodeToString(speechResult.audioBytes()) : ""
        );
    }

    public StreamingResponseBody streamChat(AuthenticatedUser currentUser, ChatRequest request) {
        PreparedChat preparedChat = prepareChat(currentUser, request);
        if (preparedChat.voiceMode()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        return outputStream -> writeChatStream(outputStream, currentUser, preparedChat);
    }

    private PreparedChat prepareChat(AuthenticatedUser currentUser, ChatRequest request) {
        if (currentUser == null || currentUser.userId() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        String trimmedMessage = request == null || request.message() == null ? "" : request.message().trim();
        if (trimmedMessage.isBlank() || ChatConstants.getCharLength(trimmedMessage) > ChatConstants.CHAT_INPUT_MAX_LENGTH) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        String userHash = hashUtils.sha256WithConfiguredSalt(String.valueOf(currentUser.userId()));
        rateLimitService.checkAllowed("user", userHash, CHAT_ENDPOINT, 30, Duration.ofMinutes(1));

        boolean voiceMode = request.includeAudio();
        List<ChatTurn> boundedRecentTurns = ChatRuntimePolicy.boundedRecentTurns(
                request.recentTurns(),
                voiceMode
        );
        AiPrompt aiPrompt = new AiPrompt(
                trimmedMessage,
                boundedRecentTurns,
                voiceMode
        );
        return new PreparedChat(
                aiPrompt,
                voiceMode,
                SafetyClassifier.assess(trimmedMessage, boundedRecentTurns)
        );
    }

    private void writeChatStream(OutputStream outputStream, AuthenticatedUser currentUser, PreparedChat preparedChat) {
        ChatSseWriter writer = new ChatSseWriter(outputStream, objectMapper);
        StreamDiagnostics diagnostics = new StreamDiagnostics();

        try {
            writer.send("ready", Map.of());

            if (preparedChat.safetyAssessment().requiresFixedResponse()) {
                AiResult safetyResult = ChatRuntimePolicy.safetyResult(preparedChat.safetyAssessment(), false);
                if (safetyResult.safetyLevel() == SafetyLevel.CRISIS) {
                    safetyEventService.recordChatCrisis(currentUser.userId());
                }
                writer.send("delta", Map.of("text", safetyResult.text()));
                diagnostics.firstDeltaSent();
                writer.send("done", donePayload(safetyResult.safetyLevel(), safetyResult.suggestedActions()));
                diagnostics.completed();
                return;
            }

            StreamingReplyLimiter limiter = new StreamingReplyLimiter(
                    ChatConstants.TEXT_CHAT_REPLY_MAX_LENGTH,
                    delta -> {
                        writer.send("delta", Map.of("text", delta));
                        diagnostics.firstDeltaSent();
                    }
            );
            AiResult aiResult = aiClient.streamChat(preparedChat.aiPrompt(), limiter::onDelta);
            if (!limiter.hasText()) {
                throw new BusinessException(ErrorCode.INTERNAL_ERROR);
            }
            writer.send("done", donePayload(preparedChat.safetyAssessment().safetyLevel(), aiResult.suggestedActions()));
            diagnostics.completed();
        } catch (UncheckedIOException | IOException exception) {
            // The browser closed the stream. Chat content remains request-local and is discarded.
            diagnostics.clientClosed();
        } catch (RuntimeException exception) {
            diagnostics.failed(ErrorCode.INTERNAL_ERROR);
            try {
                writer.send("error", Map.of(
                        "code", ErrorCode.INTERNAL_ERROR.getCode(),
                        "message", ErrorCode.INTERNAL_ERROR.getMessage()
                ));
            } catch (IOException ignored) {
                // The connection is already unavailable; there is nothing safe to send.
            }
        }
    }

    private Map<String, Object> donePayload(SafetyLevel safetyLevel, List<String> suggestedActions) {
        return Map.of(
                "safetyLevel", safetyLevel.name().toLowerCase(),
                "suggestedActions", suggestedActions == null ? List.of() : suggestedActions
        );
    }

    private VoiceSpeechResult synthesizeAudio(String text) {
        try {
            return voiceSpeechClient.synthesize(text);
        } catch (RuntimeException exception) {
            LOGGER.warn("voice_tts_unavailable", Map.of(
                    "endpoint", CHAT_ENDPOINT,
                    "error_code", ErrorCode.VOICE_UNAVAILABLE.getCode()
            ));
            throw new BusinessException(ErrorCode.VOICE_UNAVAILABLE);
        }
    }

    private record PreparedChat(
            AiPrompt aiPrompt,
            boolean voiceMode,
            SafetyClassifier.Assessment safetyAssessment
    ) {
    }

    @FunctionalInterface
    private interface StreamingDeltaSink {
        void accept(String delta) throws IOException;
    }

    private static final class StreamingReplyLimiter {
        private final int maxLength;
        private final StreamingDeltaSink sink;
        private final StringBuilder visibleText = new StringBuilder();
        private boolean stopped;

        private StreamingReplyLimiter(int maxLength, StreamingDeltaSink sink) {
            this.maxLength = maxLength;
            this.sink = sink;
        }

        private boolean onDelta(String rawDelta) {
            if (stopped || rawDelta == null || rawDelta.isEmpty()) {
                return !stopped;
            }

            String delta = visibleText.isEmpty() ? rawDelta.stripLeading() : rawDelta;
            if (delta.isEmpty()) {
                return true;
            }

            int currentLength = ChatConstants.getCharLength(visibleText.toString());
            int remainingContentLength = Math.max(0, maxLength - 1 - currentLength);
            int deltaLength = ChatConstants.getCharLength(delta);
            String accepted = deltaLength <= remainingContentLength
                    ? delta
                    : firstCodePoints(delta, remainingContentLength) + "…";

            if (!accepted.isEmpty()) {
                visibleText.append(accepted);
                try {
                    sink.accept(accepted);
                } catch (IOException exception) {
                    throw new UncheckedIOException(exception);
                }
            }

            if (deltaLength > remainingContentLength) {
                stopped = true;
            }
            return !stopped;
        }

        private boolean hasText() {
            return !visibleText.toString().isBlank();
        }

        private static String firstCodePoints(String value, int maxLength) {
            if (maxLength <= 0 || value.isEmpty()) {
                return "";
            }
            int codePointCount = value.codePointCount(0, value.length());
            int endIndex = value.offsetByCodePoints(0, Math.min(maxLength, codePointCount));
            return value.substring(0, endIndex);
        }
    }

    private static final class ChatSseWriter {
        private final OutputStream outputStream;
        private final ObjectMapper objectMapper;

        private ChatSseWriter(OutputStream outputStream, ObjectMapper objectMapper) {
            this.outputStream = outputStream;
            this.objectMapper = objectMapper;
        }

        private void send(String event, Object data) throws IOException {
            String frame = "event: " + event + "\n"
                    + "data: " + objectMapper.writeValueAsString(data) + "\n\n";
            outputStream.write(frame.getBytes(StandardCharsets.UTF_8));
            outputStream.flush();
        }
    }

    private static final class StreamDiagnostics {
        private final long startedAtNanos = System.nanoTime();
        private boolean firstDeltaLogged;

        private void firstDeltaSent() {
            if (firstDeltaLogged) {
                return;
            }

            firstDeltaLogged = true;
            LOGGER.info("chat_stream_first_delta", fields(200, null));
        }

        private void completed() {
            LOGGER.info("chat_stream_completed", fields(200, null));
        }

        private void clientClosed() {
            LOGGER.info("chat_stream_client_closed", fields(499, null));
        }

        private void failed(ErrorCode errorCode) {
            LOGGER.warn("chat_stream_failed", fields(500, errorCode));
        }

        private Map<String, Object> fields(int statusCode, ErrorCode errorCode) {
            Map<String, Object> fields = new java.util.LinkedHashMap<>();
            fields.put("endpoint", CHAT_ENDPOINT);
            fields.put("method", "POST");
            fields.put("status_code", statusCode);
            fields.put("duration_ms", elapsedMillis());
            if (errorCode != null) {
                fields.put("error_code", errorCode.getCode());
            }
            return fields;
        }

        private long elapsedMillis() {
            return Math.max(0L, TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAtNanos));
        }
    }
}
