package ai.minsi.config;

import ai.minsi.client.OpenAiVoiceSpeechClient;
import ai.minsi.client.VoiceSpeechClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MinsiPropertiesVoiceSpeechTest {

    @Test
    void usesOpenAiSpeechDefaults() {
        MinsiProperties.Ai ai = new MinsiProperties.Ai();
        ai.setVoiceSpeechModel("");
        ai.setVoiceSpeechEndpoint("");

        assertThat(ai.normalizedVoiceSpeechProvider()).isEqualTo("openai");
        assertThat(ai.normalizedVoiceSpeechModel()).isEqualTo("gpt-4o-mini-tts");
        assertThat(ai.normalizedVoiceSpeechEndpoint()).isEqualTo("https://api.openai.com/v1/audio/speech");
        assertThat(ai.normalizedVoiceSpeechVoice()).isEqualTo("marin");
        assertThat(ai.normalizedVoiceSpeechFormat()).isEqualTo("mp3");
        assertThat(ai.normalizedVoiceSpeechSpeed()).isEqualTo(1.06);
        assertThat(ai.normalizedVoiceSpeechConnectTimeoutMs()).isEqualTo(5000);
        assertThat(ai.normalizedVoiceSpeechReadTimeoutMs()).isEqualTo(30000);
    }

    @Test
    void keepsOpenAiDefaultsWhenSpeechProviderIsOpenAi() {
        MinsiProperties.Ai ai = new MinsiProperties.Ai();
        ai.setVoiceSpeechProvider("openai");
        ai.setVoiceSpeechModel("");
        ai.setVoiceSpeechEndpoint("");

        assertThat(ai.normalizedVoiceSpeechModel()).isEqualTo("gpt-4o-mini-tts");
        assertThat(ai.normalizedVoiceSpeechEndpoint()).isEqualTo("https://api.openai.com/v1/audio/speech");
    }

    @Test
    void fallsBackToDedicatedVoiceSpeechTimeoutDefaults() {
        MinsiProperties.Ai ai = new MinsiProperties.Ai();
        ai.setVoiceSpeechConnectTimeoutMs(0);
        ai.setVoiceSpeechReadTimeoutMs(-1);

        assertThat(ai.normalizedVoiceSpeechConnectTimeoutMs()).isEqualTo(5000);
        assertThat(ai.normalizedVoiceSpeechReadTimeoutMs()).isEqualTo(30000);
    }

    @Test
    void fallsBackToNaturalSpeechSpeedWhenConfiguredValueIsInvalid() {
        MinsiProperties.Ai ai = new MinsiProperties.Ai();
        ai.setVoiceSpeechSpeed(5.0);

        assertThat(ai.normalizedVoiceSpeechSpeed()).isEqualTo(1.06);
    }

    @Test
    void usesNaturalRealtimeSpeechSpeedByDefaultAndForInvalidValues() {
        MinsiProperties.Ai ai = new MinsiProperties.Ai();

        assertThat(ai.normalizedVoiceRealtimeModel()).isEqualTo("gpt-realtime-2.1-mini");
        assertThat(ai.normalizedVoiceRealtimeVoice()).isEqualTo("marin");
        assertThat(ai.normalizedVoiceRealtimeReasoningEffort()).isEqualTo("low");
        assertThat(ai.normalizedVoiceRealtimeSpeed()).isEqualTo(1.06);

        ai.setVoiceRealtimeSpeed(5.0);
        assertThat(ai.normalizedVoiceRealtimeSpeed()).isEqualTo(1.06);
    }

    @Test
    void createsOpenAiSpeechClientWhenOpenAiKeyExists() {
        MinsiProperties properties = new MinsiProperties();
        properties.getAi().setApiKey("test-key");
        properties.getAi().setVoiceSpeechProvider("openai");
        properties.getAi().setVoiceSpeechModel("");
        properties.getAi().setVoiceSpeechEndpoint("");

        VoiceSpeechClient client = new AiClientConfig().voiceSpeechClient(properties, new ObjectMapper());

        assertThat(client).isInstanceOf(OpenAiVoiceSpeechClient.class);
    }
}
