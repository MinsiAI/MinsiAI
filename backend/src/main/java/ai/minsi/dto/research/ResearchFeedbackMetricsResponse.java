package ai.minsi.dto.research;

import java.util.List;

public record ResearchFeedbackMetricsResponse(
        long userCount,
        long approvedFeedbackCount,
        long coveredRegionCount,
        int voluntaryPercent,
        List<String> regions
) {
}
