package ai.minsi.client;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class OpenAiRealtimeVoiceClient implements RealtimeVoiceClient {

    private static final int MAX_OUTPUT_TOKENS = 220;
    private static final int MAX_CONTEXT_TOKENS_AFTER_INSTRUCTIONS = 1600;

    private final String apiKey;
    private final String model;
    private final String voice;
    private final String reasoningEffort;
    private final double speed;
    private final int clientSecretTtlSeconds;
    private final URI endpoint;
    private final Duration requestTimeout;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public OpenAiRealtimeVoiceClient(
            String apiKey,
            String model,
            String voice,
            String reasoningEffort,
            double speed,
            int clientSecretTtlSeconds,
            URI endpoint,
            Duration connectTimeout,
            Duration requestTimeout,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.voice = voice;
        this.reasoningEffort = reasoningEffort;
        this.speed = speed;
        this.clientSecretTtlSeconds = clientSecretTtlSeconds;
        this.endpoint = endpoint;
        this.requestTimeout = requestTimeout;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(connectTimeout)
                .build();
    }

    @Override
    public RealtimeVoiceSession createClientSecret(String safetyIdentifier) {
        if (safetyIdentifier == null || safetyIdentifier.isBlank()) {
            throw new BusinessException(ErrorCode.VOICE_UNAVAILABLE);
        }

        try {
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                    .timeout(requestTimeout)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .header("OpenAI-Safety-Identifier", safetyIdentifier)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody()))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException(ErrorCode.VOICE_UNAVAILABLE);
            }

            JsonNode payload = objectMapper.readTree(response.body());
            String clientSecret = payload.path("value").asText("");
            long expiresAt = payload.path("expires_at").asLong(0);
            if (clientSecret.isBlank() || expiresAt <= 0) {
                throw new BusinessException(ErrorCode.VOICE_UNAVAILABLE);
            }
            return new RealtimeVoiceSession(clientSecret, expiresAt, model);
        } catch (IOException exception) {
            throw new BusinessException(ErrorCode.VOICE_UNAVAILABLE);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new BusinessException(ErrorCode.VOICE_UNAVAILABLE);
        }
    }

    String requestBody() throws JsonProcessingException {
        Map<String, Object> turnDetection = new LinkedHashMap<>();
        turnDetection.put("type", "server_vad");
        turnDetection.put("threshold", 0.5);
        turnDetection.put("prefix_padding_ms", 300);
        turnDetection.put("silence_duration_ms", 500);
        turnDetection.put("create_response", true);
        turnDetection.put("interrupt_response", true);

        Map<String, Object> audioInput = new LinkedHashMap<>();
        audioInput.put("noise_reduction", Map.of("type", "near_field"));
        audioInput.put("turn_detection", turnDetection);

        Map<String, Object> audioOutput = new LinkedHashMap<>();
        audioOutput.put("voice", voice);
        audioOutput.put("speed", speed);

        Map<String, Object> session = new LinkedHashMap<>();
        session.put("type", "realtime");
        session.put("model", model);
        session.put("output_modalities", List.of("audio"));
        session.put("instructions", realtimeInstructions());
        session.put("max_output_tokens", MAX_OUTPUT_TOKENS);
        session.put("reasoning", Map.of("effort", reasoningEffort));
        session.put("audio", Map.of("input", audioInput, "output", audioOutput));
        session.put("tracing", null);
        session.put("truncation", Map.of(
                "type", "retention_ratio",
                "retention_ratio", 0.8,
                "token_limits", Map.of(
                        "post_instructions", MAX_CONTEXT_TOKENS_AFTER_INSTRUCTIONS
                )
        ));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("expires_after", Map.of(
                "anchor", "created_at",
                "seconds", clientSecretTtlSeconds
        ));
        body.put("session", session);
        return objectMapper.writeValueAsString(body);
    }

    private String realtimeInstructions() {
        return MinsiChatPrompt.SYSTEM_PROMPT
                + "\n\n"
                + MinsiChatPrompt.REALTIME_VOICE_PROMPT
                + "\n\n"
                + MinsiChatPrompt.REALTIME_AUDIO_STYLE_PROMPT;
    }
}
