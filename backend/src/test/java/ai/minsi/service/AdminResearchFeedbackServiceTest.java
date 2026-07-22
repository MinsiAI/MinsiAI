package ai.minsi.service;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.dto.admin.AdminResearchFeedbackPageResponse;
import ai.minsi.dto.admin.AdminResearchFeedbackUpdateRequest;
import ai.minsi.entity.ResearchFeedback;
import ai.minsi.mapper.ResearchFeedbackMapper;
import ai.minsi.security.AdminAuthenticatedUser;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminResearchFeedbackServiceTest {

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void approveRequiresReviewedDisplayTextAndWritesRedactedAuditLog() {
        ResearchFeedbackMapper mapper = mock(ResearchFeedbackMapper.class);
        AdminAuditService auditService = mock(AdminAuditService.class);
        AdminResearchFeedbackService service = newService(mapper, auditService);
        ResearchFeedback feedback = pendingFeedback();
        when(mapper.selectById(42L)).thenReturn(feedback);

        service.update(
                moderator(),
                42L,
                new AdminResearchFeedbackUpdateRequest("approved", "匿名展示文本", "脱敏展示文本", null),
                auditContext()
        );

        ArgumentCaptor<ResearchFeedback> feedbackCaptor = ArgumentCaptor.forClass(ResearchFeedback.class);
        verify(mapper).updateById(feedbackCaptor.capture());
        ResearchFeedback updated = feedbackCaptor.getValue();
        assertThat(updated.getReviewStatus()).isEqualTo(AdminResearchFeedbackService.STATUS_APPROVED);
        assertThat(updated.getApproved()).isTrue();
        assertThat(updated.getDisplayText()).isEqualTo("匿名展示文本");
        assertThat(updated.getRedactedText()).isEqualTo("脱敏展示文本");

        ArgumentCaptor<Map> metadataCaptor = ArgumentCaptor.forClass(Map.class);
        verify(auditService).record(
                eq(moderator()),
                eq("research_feedback.approve"),
                eq("research_feedback"),
                eq("42"),
                eq("success"),
                eq(auditContext()),
                metadataCaptor.capture()
        );
        assertThat(metadataCaptor.getValue())
                .containsEntry("from_status", "pending")
                .containsEntry("to_status", "approved");
        assertThat(metadataCaptor.getValue().toString()).doesNotContain("raw feedback text");
    }

    @Test
    void approveWithoutDisplayTextIsRejectedBeforeUpdate() {
        ResearchFeedbackMapper mapper = mock(ResearchFeedbackMapper.class);
        AdminAuditService auditService = mock(AdminAuditService.class);
        AdminResearchFeedbackService service = newService(mapper, auditService);
        when(mapper.selectById(42L)).thenReturn(pendingFeedback());

        assertThatThrownBy(() -> service.update(
                moderator(),
                42L,
                new AdminResearchFeedbackUpdateRequest("approved", "", "", null),
                auditContext()
        ))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.BAD_REQUEST);

        verify(mapper, never()).updateById(any(ResearchFeedback.class));
        verify(auditService, never()).record(any(AdminAuthenticatedUser.class), any(), any(), any(), any(), any(), any());
    }

    @Test
    void feedbackModerationRequiresModeratorOrOwner() {
        ResearchFeedbackMapper mapper = mock(ResearchFeedbackMapper.class);
        AdminResearchFeedbackService service = newService(mapper, mock(AdminAuditService.class));

        assertThatThrownBy(() -> service.list(new AdminAuthenticatedUser(12L, "admin-hash", "a***@example.com", "viewer"), "pending", 1, 20))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FORBIDDEN);
    }

    @Test
    void listReturnsPaginationMetadata() {
        ResearchFeedbackMapper mapper = mock(ResearchFeedbackMapper.class);
        AdminResearchFeedbackService service = newService(mapper, mock(AdminAuditService.class));
        when(mapper.selectCount(any())).thenReturn(51L);
        when(mapper.selectList(any())).thenReturn(List.of(pendingFeedback()));

        AdminResearchFeedbackPageResponse response = service.list(moderator(), "pending", 2, null);

        assertThat(response.page()).isEqualTo(2);
        assertThat(response.limit()).isEqualTo(20);
        assertThat(response.totalCount()).isEqualTo(51L);
        assertThat(response.hasPrevious()).isTrue();
        assertThat(response.hasNext()).isTrue();
        assertThat(response.items()).hasSize(1);
    }

    @Test
    void listRejectsUnsupportedPageSize() {
        ResearchFeedbackMapper mapper = mock(ResearchFeedbackMapper.class);
        AdminResearchFeedbackService service = newService(mapper, mock(AdminAuditService.class));

        assertThatThrownBy(() -> service.list(moderator(), "pending", 1, 25))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.BAD_REQUEST);

        verify(mapper, never()).selectCount(any());
        verify(mapper, never()).selectList(any());
    }

    private AdminResearchFeedbackService newService(ResearchFeedbackMapper mapper, AdminAuditService auditService) {
        return new AdminResearchFeedbackService(
                mapper,
                new AdminAuthorizationService(),
                auditService
        );
    }

    private ResearchFeedback pendingFeedback() {
        ResearchFeedback feedback = new ResearchFeedback();
        feedback.setId(42L);
        feedback.setFeedbackText("raw feedback text");
        feedback.setReviewStatus(AdminResearchFeedbackService.STATUS_PENDING);
        feedback.setApproved(false);
        return feedback;
    }

    private AdminAuthenticatedUser moderator() {
        return new AdminAuthenticatedUser(11L, "admin-hash", "m***@example.com", "moderator");
    }

    private AdminAuditService.AdminAuditContext auditContext() {
        return new AdminAuditService.AdminAuditContext("request-1", "ip-hash");
    }
}
