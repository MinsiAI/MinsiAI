package ai.minsi.client;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HexFormat;
import java.util.UUID;

public final class OpenAiVoiceTranscriptionClient implements VoiceTranscriptionClient {

    private final String apiKey;
    private final String model;
    private final URI endpoint;
    private final Duration requestTimeout;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public OpenAiVoiceTranscriptionClient(
            String apiKey,
            String model,
            URI endpoint,
            Duration connectTimeout,
            Duration requestTimeout,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.endpoint = endpoint;
        this.requestTimeout = requestTimeout;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(connectTimeout)
                .build();
    }

    @Override
    public VoiceTranscriptionResult transcribe(VoiceAudioInput input) {
        if (input == null || !input.hasAudioBytes()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        try {
            String boundary = "minsi-" + UUID.randomUUID();
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                    .timeout(requestTimeout)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Accept", "application/json")
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(multipartBody(boundary, input)))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException(ErrorCode.INTERNAL_ERROR);
            }
            return new VoiceTranscriptionResult(readText(response.body()));
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }
    }

    private byte[] multipartBody(String boundary, VoiceAudioInput input) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        writeTextPart(output, boundary, "model", model);
        writeTextPart(output, boundary, "response_format", "json");
        writeFilePart(output, boundary, input);
        output.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        return output.toByteArray();
    }

    private void writeTextPart(ByteArrayOutputStream output, String boundary, String name, String value) throws IOException {
        output.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        output.write(("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        output.write(value.getBytes(StandardCharsets.UTF_8));
        output.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private void writeFilePart(ByteArrayOutputStream output, String boundary, VoiceAudioInput input) throws IOException {
        String filename = input.filename().isBlank() ? fallbackFilename(input.mimeType()) : input.filename();
        String mimeType = input.mimeType().isBlank() ? "audio/webm" : input.mimeType();
        output.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        output.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + sanitizeFilename(filename) + "\"\r\n").getBytes(StandardCharsets.UTF_8));
        output.write(("Content-Type: " + mimeType + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        output.write(input.audioBytes());
        output.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private String readText(String body) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(body);
        String text = root.path("text").asText("").trim();
        if (text.isBlank()) {
            throw new BusinessException(ErrorCode.VOICE_NOT_CLEAR);
        }
        return text;
    }

    private String fallbackFilename(String mimeType) {
        return "voice-input." + switch (mimeType) {
            case "audio/mpeg", "audio/mp3" -> "mp3";
            case "audio/mp4" -> "mp4";
            case "audio/m4a" -> "m4a";
            case "audio/ogg" -> "ogg";
            case "audio/wav", "audio/wave", "audio/x-wav" -> "wav";
            default -> "webm";
        };
    }

    private String sanitizeFilename(String filename) {
        StringBuilder sanitized = new StringBuilder();
        for (int index = 0; index < filename.length(); index += 1) {
            char character = filename.charAt(index);
            if ((character >= 'a' && character <= 'z')
                    || (character >= 'A' && character <= 'Z')
                    || (character >= '0' && character <= '9')
                    || character == '.'
                    || character == '-'
                    || character == '_') {
                sanitized.append(character);
            }
        }
        if (sanitized.isEmpty()) {
            return "voice-input-" + HexFormat.of().formatHex(UUID.randomUUID().toString().getBytes(StandardCharsets.UTF_8), 0, 6) + ".webm";
        }
        return sanitized.toString();
    }
}
