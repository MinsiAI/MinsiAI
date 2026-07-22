package ai.minsi.config;

public final class ChatConstants {

    public static final int CHAT_INPUT_WARNING_LENGTH = 400;
    public static final int CHAT_INPUT_MAX_LENGTH = 800;
    public static final int CHAT_MAX_OUTPUT_TOKENS = 240;
    public static final int VOICE_CHAT_MAX_OUTPUT_TOKENS = 200;
    public static final int CHAT_CONTEXT_MAX_TURNS = 8;
    public static final int TEXT_CHAT_CONTEXT_MAX_LENGTH = 2400;
    public static final int VOICE_CHAT_CONTEXT_MAX_LENGTH = 1200;
    public static final int TEXT_CHAT_REPLY_MAX_LENGTH = 140;
    public static final int VOICE_CHAT_REPLY_MAX_LENGTH = 120;

    private ChatConstants() {
    }

    public static int getCharLength(String value) {
        if (value == null || value.isEmpty()) {
            return 0;
        }
        return value.codePointCount(0, value.length());
    }
}
