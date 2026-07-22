package ai.minsi.dto.safety;

public record SafetyResourceResponse(
        String id,
        String name,
        String contact,
        String available,
        String disclaimer
) {
}
