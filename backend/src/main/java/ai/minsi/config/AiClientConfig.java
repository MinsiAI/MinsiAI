package ai.minsi.config;

import ai.minsi.client.AiClient;
import ai.minsi.client.ClaudeAiClient;
import ai.minsi.client.MockAiClient;
import ai.minsi.client.MockVoiceSpeechClient;
import ai.minsi.client.MockVoiceTranscriptionClient;
import ai.minsi.client.OpenAiCompatibleChatAiClient;
import ai.minsi.client.OpenAiResponsesAiClient;
import ai.minsi.client.OpenAiVoiceSpeechClient;
import ai.minsi.client.OpenAiVoiceTranscriptionClient;
import ai.minsi.client.OpenAiRealtimeVoiceClient;
import ai.minsi.client.RealtimeVoiceClient;
import ai.minsi.client.UnavailableRealtimeVoiceClient;
import ai.minsi.client.VoiceSpeechClient;
import ai.minsi.client.VoiceTranscriptionClient;
import ai.minsi.logging.SanitizedLogger;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.time.Duration;
import java.util.Map;

@Configuration
public class AiClientConfig {

    private static final SanitizedLogger LOGGER = SanitizedLogger.getLogger(AiClientConfig.class);

    @Bean
    public AiClient aiClient(MinsiProperties properties, ObjectMapper objectMapper) {
        MinsiProperties.Ai ai = properties.getAi();
        String provider = normalizeProvider(ai.normalizedProvider());

        return switch (provider) {
            case "mock" -> new MockAiClient();
            case "openai" -> openAiClient(ai, objectMapper);
            case "openai-compatible" -> openAiCompatibleClient(ai, objectMapper);
            case "claude" -> claudeClient(ai, objectMapper);
            default -> {
                logMockFallback("unsupported_provider", "AI_PROVIDER_UNSUPPORTED");
                yield new MockAiClient();
            }
        };
    }

    @Bean
    public VoiceTranscriptionClient voiceTranscriptionClient(MinsiProperties properties, ObjectMapper objectMapper) {
        MinsiProperties.Ai ai = properties.getAi();
        String provider = normalizeProvider(ai.normalizedVoiceTranscriptionProvider());
        if (!"openai".equals(provider)) {
            logMockFallback("voice_stt_provider", "VOICE_TRANSCRIPTION_PROVIDER_UNSUPPORTED");
            return new MockVoiceTranscriptionClient();
        }
        if (!StringUtils.hasText(ai.normalizedApiKey())) {
            logMockFallback("voice_stt_openai", "AI_API_KEY_MISSING");
            return new MockVoiceTranscriptionClient();
        }

        return new OpenAiVoiceTranscriptionClient(
                ai.normalizedApiKey(),
                ai.normalizedVoiceTranscriptionModel(),
                URI.create(ai.normalizedVoiceTranscriptionEndpoint()),
                Duration.ofMillis(ai.normalizedConnectTimeoutMs()),
                Duration.ofMillis(ai.normalizedReadTimeoutMs()),
                objectMapper
        );
    }

    @Bean
    public VoiceSpeechClient voiceSpeechClient(MinsiProperties properties, ObjectMapper objectMapper) {
        MinsiProperties.Ai ai = properties.getAi();
        String provider = normalizeProvider(ai.normalizedVoiceSpeechProvider());
        return switch (provider) {
            case "openai" -> openAiVoiceSpeechClient(ai, objectMapper);
            case "mock" -> new MockVoiceSpeechClient();
            default -> {
                logMockFallback("voice_speech_provider", "VOICE_SPEECH_PROVIDER_UNSUPPORTED");
                yield new MockVoiceSpeechClient();
            }
        };
    }

    @Bean
    public RealtimeVoiceClient realtimeVoiceClient(MinsiProperties properties, ObjectMapper objectMapper) {
        MinsiProperties.Ai ai = properties.getAi();
        String provider = normalizeProvider(ai.normalizedVoiceRealtimeProvider());
        if (!"openai".equals(provider)) {
            logMockFallback("voice_realtime_provider", "VOICE_REALTIME_PROVIDER_UNSUPPORTED");
            return new UnavailableRealtimeVoiceClient();
        }
        if (!StringUtils.hasText(ai.normalizedApiKey())) {
            logMockFallback("voice_realtime_openai", "AI_API_KEY_MISSING");
            return new UnavailableRealtimeVoiceClient();
        }

        return new OpenAiRealtimeVoiceClient(
                ai.normalizedApiKey(),
                ai.normalizedVoiceRealtimeModel(),
                ai.normalizedVoiceRealtimeVoice(),
                ai.normalizedVoiceRealtimeReasoningEffort(),
                ai.normalizedVoiceRealtimeSpeed(),
                ai.normalizedVoiceRealtimeClientSecretTtlSeconds(),
                URI.create(ai.normalizedVoiceRealtimeEndpoint()),
                Duration.ofMillis(ai.normalizedConnectTimeoutMs()),
                Duration.ofMillis(ai.normalizedReadTimeoutMs()),
                objectMapper
        );
    }

    private AiClient openAiClient(MinsiProperties.Ai ai, ObjectMapper objectMapper) {
        if (!StringUtils.hasText(ai.normalizedApiKey())) {
            logMockFallback("openai", "AI_API_KEY_MISSING");
            return new MockAiClient();
        }

        return new OpenAiResponsesAiClient(
                ai.normalizedApiKey(),
                ai.normalizedModel(),
                URI.create(ai.normalizedEndpoint("openai")),
                ai.normalizedMaxTokens(),
                ai.normalizedReasoningEffort(),
                Duration.ofMillis(ai.normalizedConnectTimeoutMs()),
                Duration.ofMillis(ai.normalizedReadTimeoutMs()),
                objectMapper
        );
    }

    private AiClient openAiCompatibleClient(MinsiProperties.Ai ai, ObjectMapper objectMapper) {
        if (!StringUtils.hasText(ai.normalizedApiKey())) {
            logMockFallback("openai_compatible", "AI_API_KEY_MISSING");
            return new MockAiClient();
        }

        return new OpenAiCompatibleChatAiClient(
                ai.normalizedApiKey(),
                ai.normalizedModel(),
                URI.create(ai.normalizedEndpoint("openai-compatible")),
                ai.normalizedMaxTokens(),
                Duration.ofMillis(ai.normalizedConnectTimeoutMs()),
                Duration.ofMillis(ai.normalizedReadTimeoutMs()),
                objectMapper
        );
    }

    private AiClient claudeClient(MinsiProperties.Ai ai, ObjectMapper objectMapper) {
        if (!StringUtils.hasText(ai.getAnthropicApiKey())) {
            logMockFallback("claude", "ANTHROPIC_API_KEY_MISSING");
            return new MockAiClient();
        }

        return new ClaudeAiClient(
                ai.getAnthropicApiKey().trim(),
                ai.normalizedAnthropicModel(),
                URI.create(ai.normalizedAnthropicEndpoint()),
                ai.normalizedAnthropicMaxTokens(),
                Duration.ofMillis(ai.normalizedAnthropicConnectTimeoutMs()),
                Duration.ofMillis(ai.normalizedAnthropicReadTimeoutMs()),
                objectMapper
        );
    }

    private VoiceSpeechClient openAiVoiceSpeechClient(MinsiProperties.Ai ai, ObjectMapper objectMapper) {
        if (!StringUtils.hasText(ai.normalizedApiKey())) {
            logMockFallback("voice_speech_openai", "AI_API_KEY_MISSING");
            return new MockVoiceSpeechClient();
        }

        return new OpenAiVoiceSpeechClient(
                ai.normalizedApiKey(),
                ai.normalizedVoiceSpeechModel(),
                ai.normalizedVoiceSpeechVoice(),
                ai.normalizedVoiceSpeechInstructions(),
                ai.normalizedVoiceSpeechFormat(),
                ai.normalizedVoiceSpeechSpeed(),
                URI.create(ai.normalizedVoiceSpeechEndpoint()),
                Duration.ofMillis(ai.normalizedVoiceSpeechConnectTimeoutMs()),
                Duration.ofMillis(ai.normalizedVoiceSpeechReadTimeoutMs()),
                objectMapper
        );
    }

    private String normalizeProvider(String provider) {
        return switch (provider) {
            case "chatgpt", "open-ai" -> "openai";
            case "compatible", "domestic", "openai_compatible", "openai-compatible" -> "openai-compatible";
            case "anthropic", "claude" -> "claude";
            case "mock" -> "mock";
            default -> provider;
        };
    }

    private void logMockFallback(String eventSuffix, String errorCode) {
        LOGGER.warn("ai_client_mock_fallback." + eventSuffix, Map.of(
                "endpoint", "/api/chat",
                "error_code", errorCode
        ));
    }
}
