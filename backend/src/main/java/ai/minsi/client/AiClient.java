package ai.minsi.client;

public interface AiClient {

    AiResult chat(AiPrompt prompt);

    default AiResult streamChat(AiPrompt prompt, AiStreamListener listener) {
        AiResult result = chat(prompt);
        listener.onDelta(result.text());
        return result;
    }
}
