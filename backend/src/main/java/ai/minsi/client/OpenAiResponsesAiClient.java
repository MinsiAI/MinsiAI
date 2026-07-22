package ai.minsi.client;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.dto.chat.SafetyLevel;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

public final class OpenAiResponsesAiClient implements AiClient {

    private final String apiKey;
    private final String model;
    private final URI endpoint;
    private final int maxOutputTokens;
    private final String reasoningEffort;
    private final Duration requestTimeout;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public OpenAiResponsesAiClient(
            String apiKey,
            String model,
            URI endpoint,
            int maxOutputTokens,
            String reasoningEffort,
            Duration connectTimeout,
            Duration requestTimeout,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.endpoint = endpoint;
        this.maxOutputTokens = maxOutputTokens;
        this.reasoningEffort = reasoningEffort;
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
        String reply = requestOpenAi(prompt);
        return new AiResult(reply, safetyLevel, AiClientSupport.suggestedActions(safetyLevel));
    }

    @Override
    public AiResult streamChat(AiPrompt prompt, AiStreamListener listener) {
        String text = AiClientSupport.normalizeText(prompt);
        SafetyLevel safetyLevel = SafetyClassifier.classify(text);
        String reply = requestOpenAiStream(prompt, listener);
        return new AiResult(reply, safetyLevel, AiClientSupport.suggestedActions(safetyLevel));
    }

    private String requestOpenAi(AiPrompt prompt) {
        try {
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                    .timeout(requestTimeout)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody(prompt, false)))
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

    private String requestOpenAiStream(AiPrompt prompt, AiStreamListener listener) {
        try {
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                    .timeout(requestTimeout)
                    .header("Content-Type", "application/json")
                    .header("Accept", "text/event-stream")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody(prompt, true)))
                    .build();
            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                response.body().close();
                throw new BusinessException(ErrorCode.INTERNAL_ERROR);
            }
            return readStreamingReply(response.body(), listener);
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }
    }

    String requestBody(AiPrompt prompt, boolean stream) throws JsonProcessingException {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("instructions", AiClientSupport.systemPrompt(prompt));
        body.put("input", AiClientSupport.chatMessages(prompt));
        body.put("max_output_tokens", AiClientSupport.maxOutputTokens(prompt, maxOutputTokens));
        body.put("reasoning", Map.of("effort", reasoningEffort));
        body.put("store", false);
        body.put("stream", stream);
        return objectMapper.writeValueAsString(body);
    }

    String readStreamingReply(InputStream inputStream, AiStreamListener listener) throws IOException {
        StringBuilder reply = new StringBuilder();
        String eventType = "";

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isEmpty()) {
                    eventType = "";
                    continue;
                }
                if (line.startsWith("event:")) {
                    eventType = line.substring("event:".length()).trim();
                    continue;
                }
                if (!line.startsWith("data:")) {
                    continue;
                }

                String data = line.substring("data:".length()).trim();
                if (data.isEmpty() || "[DONE]".equals(data)) {
                    continue;
                }

                JsonNode event = objectMapper.readTree(data);
                String type = event.path("type").asText(eventType);
                if ("response.output_text.delta".equals(type)) {
                    String delta = event.path("delta").asText("");
                    if (!delta.isEmpty()) {
                        reply.append(delta);
                        if (!listener.onDelta(delta)) {
                            break;
                        }
                    }
                    continue;
                }
                if ("error".equals(type) || "response.failed".equals(type)) {
                    throw new BusinessException(ErrorCode.INTERNAL_ERROR);
                }
            }
        }

        String normalizedReply = reply.toString().trim();
        if (normalizedReply.isEmpty()) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }
        return normalizedReply;
    }

    private String readReply(String body) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(body);
        String outputText = root.path("output_text").asText("");
        if (!outputText.isBlank()) {
            return outputText.trim();
        }

        StringBuilder reply = new StringBuilder();
        JsonNode output = root.path("output");
        if (output.isArray()) {
            for (JsonNode item : output) {
                appendTextBlocks(reply, item.path("content"));
            }
        }

        if (reply.length() == 0) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }

        return reply.toString();
    }

    private void appendTextBlocks(StringBuilder reply, JsonNode content) {
        if (!content.isArray()) {
            return;
        }

        for (JsonNode block : content) {
            String type = block.path("type").asText("");
            if ("output_text".equals(type) || "text".equals(type)) {
                String text = block.path("text").asText("");
                if (!text.isBlank()) {
                    if (reply.length() > 0) {
                        reply.append('\n');
                    }
                    reply.append(text.trim());
                }
            }
        }
    }
}
