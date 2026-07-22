package ai.minsi.client;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.dto.chat.SafetyLevel;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

public final class ClaudeAiClient implements AiClient {

    private static final String ANTHROPIC_VERSION = "2023-06-01";

    private final String apiKey;
    private final String model;
    private final URI endpoint;
    private final int maxTokens;
    private final Duration requestTimeout;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ClaudeAiClient(
            String apiKey,
            String model,
            URI endpoint,
            int maxTokens,
            Duration connectTimeout,
            Duration requestTimeout,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.endpoint = endpoint;
        this.maxTokens = maxTokens;
        this.requestTimeout = requestTimeout;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(connectTimeout)
                .build();
    }

    @Override
    public AiResult chat(AiPrompt prompt) {
        String text = AiClientSupport.normalizeText(prompt);
        SafetyLevel safetyLevel = SafetyClassifier.classify(text);
        String reply = requestClaude(prompt);
        return new AiResult(reply, safetyLevel, AiClientSupport.suggestedActions(safetyLevel));
    }

    private String requestClaude(AiPrompt prompt) {
        try {
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                    .timeout(requestTimeout)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", ANTHROPIC_VERSION)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody(prompt)))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException(ErrorCode.INTERNAL_ERROR);
            }
            return readReply(response.body());
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }
    }

    private String requestBody(AiPrompt prompt) throws JsonProcessingException {
        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", AiClientSupport.maxOutputTokens(prompt, maxTokens),
                "system", AiClientSupport.systemPrompt(prompt),
                "messages", AiClientSupport.claudeMessages(prompt)
        );
        return objectMapper.writeValueAsString(body);
    }

    private String readReply(String body) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(body);
        JsonNode content = root.path("content");
        if (!content.isArray()) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }

        StringBuilder reply = new StringBuilder();
        for (JsonNode block : content) {
            if ("text".equals(block.path("type").asText())) {
                String text = block.path("text").asText("");
                if (!text.isBlank()) {
                    if (!reply.isEmpty()) {
                        reply.append('\n');
                    }
                    reply.append(text.trim());
                }
            }
        }

        if (reply.isEmpty()) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }

        return reply.toString();
    }
}
