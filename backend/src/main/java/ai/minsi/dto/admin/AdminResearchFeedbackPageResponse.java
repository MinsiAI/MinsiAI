package ai.minsi.dto.admin;

import java.util.List;

public record AdminResearchFeedbackPageResponse(
        List<AdminResearchFeedbackListItem> items,
        int page,
        int limit,
        long totalCount,
        boolean hasPrevious,
        boolean hasNext
) {
}
