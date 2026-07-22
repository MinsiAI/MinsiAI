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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class OpenAiCompatibleChatAiClient implements AiClient {

    private final String apiKey;
    private final String model;
    private final URI endpoint;
    private final int maxTokens;
    private final Duration requestTimeout;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public OpenAiCompatibleChatAiClient(
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
        String reply = requestModel(prompt);
        return new AiResult(reply, safetyLevel, AiClientSupport.suggestedActions(safetyLevel));
    }

    private String requestModel(AiPrompt prompt) {
        try {
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                    .timeout(requestTimeout)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
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
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", AiClientSupport.systemPrompt(prompt)));
        messages.addAll(AiClientSupport.chatMessages(prompt));

        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", AiClientSupport.maxOutputTokens(prompt, maxTokens),
                "stream", false,
                "messages", messages
        );
        return objectMapper.writeValueAsString(body);
    }

    private String readReply(String body) throws JsonProcessingException {
        JsonNode choices = objectMapper.readTree(body).path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }

        JsonNode content = choices.get(0).path("message").path("content");
        if (content.isTextual()) {
            String reply = content.asText("");
            if (!reply.isBlank()) {
                return reply.trim();
            }
        }

        if (content.isArray()) {
            StringBuilder reply = new StringBuilder();
            for (JsonNode block : content) {
                String text = block.path("text").asText("");
                if (!text.isBlank()) {
                    if (reply.length() > 0) {
                        reply.append('\n');
                    }
                    reply.append(text.trim());
                }
            }
            if (reply.length() > 0) {
                return reply.toString();
            }
        }

        throw new BusinessException(ErrorCode.INTERNAL_ERROR);
    }
}
