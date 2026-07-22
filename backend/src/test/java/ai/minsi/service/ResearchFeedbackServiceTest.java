package ai.minsi.service;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.dto.research.ResearchFeedbackSubmitRequest;
import ai.minsi.dto.research.ResearchFeedbackSubmitResponse;
import ai.minsi.entity.ResearchFeedback;
import ai.minsi.mapper.ResearchFeedbackMapper;
import ai.minsi.mapper.UserMapper;
import ai.minsi.security.AuthenticatedUser;
import ai.minsi.util.HashUtils;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ResearchFeedbackServiceTest {

    private static final String HASH_SALT = "test-salt";

    @Test
    void submitStoresOnlyResearchFeedbackAndKeepsItUnapproved() {
        ResearchFeedbackMapper mapper = mock(ResearchFeedbackMapper.class);
        ResearchFeedbackService service = newResearchFeedbackService(mapper, mock(UserMapper.class));
        ResearchFeedbackSubmitRequest request = new ResearchFeedbackSubmitRequest(
                "very",
                List.of("隐私安全", "被理解"),
                "这个入口让我更安心。"
        );

        ResearchFeedbackSubmitResponse response = service.submit(currentUser(), "127.0.0.1", request);

        ArgumentCaptor<ResearchFeedback> feedbackCaptor = ArgumentCaptor.forClass(ResearchFeedback.class);
        verify(mapper).insert(feedbackCaptor.capture());
        ResearchFeedback feedback = feedbackCaptor.getValue();

        assertThat(response.accepted()).isTrue();
        assertThat(response.publiclyVisible()).isFalse();
        assertThat(feedback.getUserId()).isEqualTo(7L);
        assertThat(feedback.getRating()).isEqualTo("very");
        assertThat(feedback.getFeedbackType()).isEqualTo("隐私安全,被理解");
        assertThat(feedback.getFeedbackText()).isEqualTo("这个入口让我更安心。");
        assertThat(feedback.getApproved()).isFalse();
        assertThat(feedback.getReviewStatus()).isEqualTo(AdminResearchFeedbackService.STATUS_PENDING);
    }

    @Test
    void submitRejectsTextOverOneThousandCharactersBeforeInsert() {
        ResearchFeedbackMapper mapper = mock(ResearchFeedbackMapper.class);
        ResearchFeedbackService service = newResearchFeedbackService(mapper, mock(UserMapper.class));
        ResearchFeedbackSubmitRequest request = new ResearchFeedbackSubmitRequest(
                "unsure",
                List.of("其他"),
                "好".repeat(ResearchFeedbackService.FEEDBACK_TEXT_MAX_LENGTH + 1)
        );

        assertThatThrownBy(() -> service.submit(currentUser(), "127.0.0.1", request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.BAD_REQUEST);
        verify(mapper, never()).insert(any(ResearchFeedback.class));
    }

    @Test
    void submitCanRemainAnonymousWithoutPersistingClientIp() {
        ResearchFeedbackMapper mapper = mock(ResearchFeedbackMapper.class);
        ResearchFeedbackService service = newResearchFeedbackService(mapper, mock(UserMapper.class));
        ResearchFeedbackSubmitRequest request = new ResearchFeedbackSubmitRequest(
                "some",
                List.of("其他"),
                "我希望隐私说明再短一点。"
        );

        service.submit(null, "127.0.0.1", request);

        ArgumentCaptor<ResearchFeedback> feedbackCaptor = ArgumentCaptor.forClass(ResearchFeedback.class);
        verify(mapper).insert(feedbackCaptor.capture());
        ResearchFeedback feedback = feedbackCaptor.getValue();

        assertThat(feedback.getUserId()).isNull();
        assertThat(feedback.getFeedbackText()).isEqualTo("我希望隐私说明再短一点。");
        assertThat(feedback.getApproved()).isFalse();
        assertThat(feedback.getReviewStatus()).isEqualTo(AdminResearchFeedbackService.STATUS_PENDING);
    }

    @Test
    void listApprovedReturnsReviewedDisplayTextInsteadOfRawFeedbackText() {
        ResearchFeedbackMapper mapper = mock(ResearchFeedbackMapper.class);
        ResearchFeedbackService service = newResearchFeedbackService(mapper, mock(UserMapper.class));
        ResearchFeedback approvedFeedback = new ResearchFeedback();
        approvedFeedback.setApproved(true);
        approvedFeedback.setReviewStatus(AdminResearchFeedbackService.STATUS_APPROVED);
        approvedFeedback.setFeedbackText("raw text should stay admin-only");
        approvedFeedback.setDisplayText("匿名展示文本");
        approvedFeedback.setRedactedText("脱敏展示文本");
        approvedFeedback.setFeedbackType("隐私安全");
        approvedFeedback.setRating("very");

        when(mapper.selectList(any(Wrapper.class))).thenReturn(List.of(approvedFeedback));

        var approved = service.listApproved();

        assertThat(approved).hasSize(1);
        assertThat(approved.get(0).feedbackText()).isEqualTo("脱敏展示文本");
        assertThat(approved.get(0).feedbackText()).doesNotContain("raw text");
    }

    @Test
    void metricsReturnsOnlyAggregateCounts() {
        ResearchFeedbackMapper mapper = mock(ResearchFeedbackMapper.class);
        UserMapper userMapper = mock(UserMapper.class);
        ResearchFeedbackService service = newResearchFeedbackService(mapper, userMapper);
        ResearchFeedback seededFeedback = new ResearchFeedback();
        seededFeedback.setApproved(true);
        seededFeedback.setReviewStatus(AdminResearchFeedbackService.STATUS_APPROVED);
        seededFeedback.setFeedbackText("raw text should stay admin-only");
        seededFeedback.setRedactedText("我一开始担心自己说得太乱，后来发现可以慢慢讲，不需要马上整理成完整故事，这让我更愿意继续试用。");

        when(userMapper.selectCount(any())).thenReturn(48L);
        when(mapper.selectCount(any(Wrapper.class))).thenReturn(9L, 10L);
        when(mapper.selectList(any(Wrapper.class))).thenReturn(List.of(seededFeedback));

        var metrics = service.metrics();

        assertThat(metrics.userCount()).isEqualTo(48L);
        assertThat(metrics.approvedFeedbackCount()).isEqualTo(9L);
        assertThat(metrics.coveredRegionCount()).isEqualTo(1L);
        assertThat(metrics.voluntaryPercent()).isEqualTo(100);
        assertThat(metrics.regions()).containsExactly("北京");
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private ResearchFeedbackService newResearchFeedbackService(ResearchFeedbackMapper mapper, UserMapper userMapper) {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        ValueOperations<String, String> valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenReturn(1L);

        return new ResearchFeedbackService(
                mapper,
                userMapper,
                new RateLimitService(redisTemplate),
                new HashUtils(HASH_SALT)
        );
    }

    private AuthenticatedUser currentUser() {
        return new AuthenticatedUser(7L, "child@example.com", "email", "邮箱");
    }
}
