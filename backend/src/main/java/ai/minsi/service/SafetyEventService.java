package ai.minsi.service;

import ai.minsi.entity.SafetyEvent;
import ai.minsi.logging.SanitizedLogger;
import ai.minsi.mapper.SafetyEventMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class SafetyEventService {

    private static final SanitizedLogger LOGGER = SanitizedLogger.getLogger(SafetyEventService.class);

    private final SafetyEventMapper safetyEventMapper;

    public SafetyEventService(SafetyEventMapper safetyEventMapper) {
        this.safetyEventMapper = safetyEventMapper;
    }

    public void recordChatCrisis(Long userId) {
        SafetyEvent safetyEvent = new SafetyEvent();
        safetyEvent.setUserId(userId);
        safetyEvent.setEventType("chat_crisis_detected");
        safetyEvent.setSeverity("crisis");
        safetyEvent.setMetadataRedacted("{\"source\":\"chat\"}");
        safetyEvent.setCreatedAt(LocalDateTime.now());

        try {
            safetyEventMapper.insert(safetyEvent);
        } catch (RuntimeException exception) {
            LOGGER.warn("safety_event_write_failed", Map.of(
                    "endpoint", "/api/chat",
                    "error_code", "SAFETY_EVENT_WRITE_FAILED"
            ));
        }
    }
}
