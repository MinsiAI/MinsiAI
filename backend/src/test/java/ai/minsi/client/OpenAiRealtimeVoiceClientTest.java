package ai.minsi.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class OpenAiRealtimeVoiceClientTest {

    @Test
    void buildsShortLivedRealtimeSessionWithoutTracing() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        OpenAiRealtimeVoiceClient client = new OpenAiRealtimeVoiceClient(
                "test-api-key",
                "gpt-realtime-2.1-mini",
                "marin",
                "low",
                1.06,
                600,
                URI.create("https://api.openai.com/v1/realtime/client_secrets"),
                Duration.ofSeconds(2),
                Duration.ofSeconds(2),
                objectMapper
        );

        JsonNode payload = objectMapper.readTree(client.requestBody());

        assertThat(payload.path("expires_after").path("seconds").asInt()).isEqualTo(600);
        assertThat(payload.path("session").path("model").asText()).isEqualTo("gpt-realtime-2.1-mini");
        assertThat(payload.path("session").path("reasoning").path("effort").asText()).isEqualTo("low");
        assertThat(payload.path("session").path("audio").path("output").path("voice").asText()).isEqualTo("marin");
        assertThat(payload.path("session").path("audio").path("output").path("speed").asDouble()).isEqualTo(1.06);
        assertThat(payload.path("session").path("audio").path("input").path("turn_detection").path("interrupt_response").asBoolean()).isTrue();
        assertThat(payload.path("session").path("audio").path("input").path("turn_detection").path("silence_duration_ms").asInt()).isEqualTo(500);
        assertThat(payload.path("session").path("max_output_tokens").asInt()).isEqualTo(220);
        assertThat(payload.path("session").path("truncation").path("type").asText()).isEqualTo("retention_ratio");
        assertThat(payload.path("session").path("truncation").path("retention_ratio").asDouble()).isEqualTo(0.8);
        assertThat(payload.path("session").path("truncation").path("token_limits").path("post_instructions").asInt())
                .isEqualTo(1600);
        assertThat(payload.path("session").path("tracing").isNull()).isTrue();
        assertThat(payload.path("session").path("instructions").asText())
                .startsWith(MinsiChatPrompt.SYSTEM_PROMPT)
                .contains(MinsiChatPrompt.REALTIME_VOICE_PROMPT)
                .contains(MinsiChatPrompt.REALTIME_AUDIO_STYLE_PROMPT)
                .contains("提问不是每轮必需")
                .contains("默认并始终使用简体中文普通话")
                .contains("不主动说 Hi、OK")
                .contains("听不清时只用简短中文")
                .contains("青少年容易听懂")
                .contains("不做成熟总结")
                .contains("年轻、清亮、柔软")
                .contains("自然青春感")
                .contains("避免成熟御姐感")
                .contains("不夹嗓");
    }
}
