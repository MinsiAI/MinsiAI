package ai.minsi.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class OpenAiVoiceSpeechClientTest {

    @Test
    void sendsExplicitNaturalSpeedAndCompactAudioFormat() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        OpenAiVoiceSpeechClient client = new OpenAiVoiceSpeechClient(
                "test-api-key",
                "gpt-4o-mini-tts",
                "shimmer",
                "Speak naturally without long pauses.",
                "mp3",
                1.10,
                URI.create("https://api.openai.com/v1/audio/speech"),
                Duration.ofSeconds(2),
                Duration.ofSeconds(2),
                objectMapper
        );

        JsonNode payload = objectMapper.readTree(client.requestBody("你好，我在听。"));

        assertThat(payload.path("response_format").asText()).isEqualTo("mp3");
        assertThat(payload.path("speed").asDouble()).isEqualTo(1.10);
        assertThat(payload.path("instructions").asText()).contains("without long pauses");
    }
}
