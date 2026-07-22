package ai.minsi.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

public final class SanitizedLogger {

    private final Logger delegate;

    private SanitizedLogger(Logger delegate) {
        this.delegate = delegate;
    }

    public static SanitizedLogger getLogger(Class<?> type) {
        return new SanitizedLogger(LoggerFactory.getLogger(type));
    }

    public void info(String event, Map<String, ?> fields) {
        delegate.info("event={} fields={}", LogSanitizer.sanitizeEvent(event), LogSanitizer.sanitizeFields(fields));
    }

    public void warn(String event, Map<String, ?> fields) {
        delegate.warn("event={} fields={}", LogSanitizer.sanitizeEvent(event), LogSanitizer.sanitizeFields(fields));
    }

    public void error(String event, Map<String, ?> fields) {
        delegate.error("event={} fields={}", LogSanitizer.sanitizeEvent(event), LogSanitizer.sanitizeFields(fields));
    }
}
