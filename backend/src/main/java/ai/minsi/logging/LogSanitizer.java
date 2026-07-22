package ai.minsi.logging;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

public final class LogSanitizer {

    private static final Set<String> ALLOWED_FIELDS = Set.of(
            "user_hash",
            "admin_user_hash",
            "ip_hash",
            "email_hash",
            "endpoint",
            "method",
            "status_code",
            "error_code",
            "duration_ms",
            "request_id"
    );

    private static final Set<String> DENIED_KEYS = Set.of(
            "message",
            "reply",
            "token",
            "session",
            "session_token",
            "password",
            "api_key",
            "hash_salt",
            "voice_" + "transcript",
            "emotion_" + "text"
    );

    private static final Pattern SAFE_EVENT = Pattern.compile("[^a-zA-Z0-9_.-]");
    private static final int MAX_VALUE_LENGTH = 256;

    private LogSanitizer() {
    }

    public static String sanitizeEvent(String event) {
        if (event == null || event.isBlank()) {
            return "event";
        }

        String lowerEvent = event.toLowerCase();
        if (DENIED_KEYS.stream().anyMatch(lowerEvent::contains)) {
            return "redacted_event";
        }

        return SAFE_EVENT.matcher(event).replaceAll("_");
    }

    public static Map<String, Object> sanitizeFields(Map<String, ?> fields) {
        Map<String, Object> sanitized = new LinkedHashMap<>();
        if (fields == null || fields.isEmpty()) {
            return sanitized;
        }

        for (Map.Entry<String, ?> entry : fields.entrySet()) {
            String key = entry.getKey();
            if (!isAllowedKey(key)) {
                continue;
            }
            sanitized.put(key, sanitizeValue(entry.getValue()));
        }

        return sanitized;
    }

    private static boolean isAllowedKey(String key) {
        if (!ALLOWED_FIELDS.contains(key)) {
            return false;
        }

        String lowerKey = key.toLowerCase();
        return DENIED_KEYS.stream().noneMatch(lowerKey::contains);
    }

    private static Object sanitizeValue(Object value) {
        if (value == null || value instanceof Number || value instanceof Boolean) {
            return value;
        }

        String text = String.valueOf(value)
                .replace('\n', ' ')
                .replace('\r', ' ')
                .trim();

        if (text.length() > MAX_VALUE_LENGTH) {
            return text.substring(0, MAX_VALUE_LENGTH);
        }

        return text;
    }
}
