package ai.minsi.client;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

public final class OpenAiVoiceSpeechClient implements VoiceSpeechClient {

    private final String apiKey;
    private final String model;
    private final String voice;
    private final String instructions;
    private final String responseFormat;
    private final double speed;
    private final URI endpoint;
    private final Duration requestTimeout;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public OpenAiVoiceSpeechClient(
            String apiKey,
            String model,
            String voice,
            String instructions,
            String responseFormat,
            double speed,
            URI endpoint,
            Duration connectTimeout,
            Duration requestTimeout,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.voice = voice;
        this.instructions = instructions;
        this.responseFormat = responseFormat;
        this.speed = speed;
        this.endpoint = endpoint;
        this.requestTimeout = requestTimeout;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(connectTimeout)
                .build();
    }

    @Override
    public VoiceSpeechResult synthesize(String text) {
        if (text == null || text.isBlank()) {
            return VoiceSpeechResult.empty();
        }

        try {
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                    .timeout(requestTimeout)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Accept", audioAcceptHeader())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody(text.trim())))
                    .build();
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() < 200 || response.statusCode() >= 300 || response.body().length == 0) {
                throw new BusinessException(ErrorCode.INTERNAL_ERROR);
            }
            String contentType = response.headers()
                    .firstValue("content-type")
                    .orElse(defaultContentType());
            return new VoiceSpeechResult(contentType, response.body());
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }
    }

    String requestBody(String text) throws JsonProcessingException {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("input", text);
        body.put("voice", voice);
        body.put("response_format", responseFormat);
        body.put("speed", speed);
        if (instructions != null && !instructions.isBlank()) {
            body.put("instructions", instructions);
        }
        return objectMapper.writeValueAsString(body);
    }

    private String audioAcceptHeader() {
        return switch (responseFormat) {
            case "wav" -> "audio/wav";
            case "opus" -> "audio/opus";
            case "aac" -> "audio/aac";
            case "flac" -> "audio/flac";
            case "pcm" -> "audio/L16";
            default -> "audio/mpeg";
        };
    }

    private String defaultContentType() {
        return switch (responseFormat) {
            case "wav" -> "audio/wav";
            case "opus" -> "audio/opus";
            case "aac" -> "audio/aac";
            case "flac" -> "audio/flac";
            case "pcm" -> "audio/L16";
            default -> "audio/mpeg";
        };
    }
}
