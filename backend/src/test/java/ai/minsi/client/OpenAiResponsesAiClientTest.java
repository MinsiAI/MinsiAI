package ai.minsi.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class OpenAiResponsesAiClientTest {

    @Test
    void streamsTextDeltasWithNoReasoningAndNoStorage() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        OpenAiResponsesAiClient client = new OpenAiResponsesAiClient(
                "test-api-key",
                "gpt-5.5",
                URI.create("https://api.openai.com/v1/responses"),
                240,
                "none",
                Duration.ofSeconds(2),
                Duration.ofSeconds(2),
                objectMapper
        );
        JsonNode payload = objectMapper.readTree(client.requestBody(new AiPrompt("你好"), true));
        List<String> deltas = new ArrayList<>();
        byte[] stream = (
                "event: response.output_text.delta\n"
                        + "data: {\"type\":\"response.output_text.delta\",\"delta\":\"我在\"}\n\n"
                        + "event: response.output_text.delta\n"
                        + "data: {\"type\":\"response.output_text.delta\",\"delta\":\"。\"}\n\n"
                        + "event: response.completed\n"
                        + "data: {\"type\":\"response.completed\"}\n\n"
        ).getBytes(StandardCharsets.UTF_8);

        String reply = client.readStreamingReply(new ByteArrayInputStream(stream), delta -> {
            deltas.add(delta);
            return true;
        });

        assertThat(payload.path("stream").asBoolean()).isTrue();
        assertThat(payload.path("store").asBoolean()).isFalse();
        assertThat(payload.path("reasoning").path("effort").asText()).isEqualTo("none");
        assertThat(payload.path("max_output_tokens").asInt()).isEqualTo(240);
        assertThat(deltas).containsExactly("我在", "。");
        assertThat(reply).isEqualTo("我在。");
    }
}
