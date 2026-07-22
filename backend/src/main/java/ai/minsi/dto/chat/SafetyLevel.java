package ai.minsi.dto.chat;

import com.fasterxml.jackson.annotation.JsonValue;

public enum SafetyLevel {
    NORMAL("normal"),
    ELEVATED("elevated"),
    CRISIS("crisis");

    private final String value;

    SafetyLevel(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
