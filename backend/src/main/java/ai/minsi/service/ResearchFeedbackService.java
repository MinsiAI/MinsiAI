package ai.minsi.service;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.dto.research.ApprovedResearchFeedbackResponse;
import ai.minsi.dto.research.ResearchFeedbackMetricsResponse;
import ai.minsi.dto.research.ResearchFeedbackSubmitRequest;
import ai.minsi.dto.research.ResearchFeedbackSubmitResponse;
import ai.minsi.entity.ResearchFeedback;
import ai.minsi.entity.User;
import ai.minsi.mapper.ResearchFeedbackMapper;
import ai.minsi.mapper.UserMapper;
import ai.minsi.security.AuthenticatedUser;
import ai.minsi.util.HashUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ResearchFeedbackService {

    public static final int FEEDBACK_TEXT_MAX_LENGTH = 1000;

    private static final String FEEDBACK_ENDPOINT = "/api/research/feedback";
    private static final int MAX_FEEDBACK_PER_WINDOW = 3;
    private static final Duration FEEDBACK_WINDOW = Duration.ofHours(1);
    private static final int APPROVED_FEEDBACK_LIMIT = 20;
    private static final Map<String, String> DISPLAY_REGION_BY_SEED_FEEDBACK = Map.ofEntries(
            Map.entry("我一开始担心自己说得太乱，后来发现可以慢慢讲，不需要马上整理成完整故事，这让我更愿意继续试用。", "北京"),
            Map.entry("最有用的是入口文案不催我，也没有让我填很多信息。看到退出后会清除，我才敢把真实想法写出来。", "上海"),
            Map.entry("我希望隐私说明再靠前一点，尤其是在第一次进入聊天前。如果能用更短的句子说明不保存内容，会更安心。", "成都"),
            Map.entry("有些时候我只是想把今天发生的事说出来，不一定需要建议。Minsi 的语气比较安静，没有把我往某个结论上带。", "广州"),
            Map.entry("I was testing it late at night and liked that it didn't ask for a profile before I could start. The privacy note made the flow feel safer.", "纽约"),
            Map.entry("考试周试用的时候，我不想被提醒要立刻变好，只想先把事情讲清楚。这个节奏比较轻，不会让我有负担。", "杭州"),
            Map.entry("我会跳过一些不想回答的问题，这点很重要。研究说明里写着可以随时退出，让我觉得参与不是一种压力。", "武汉"),
            Map.entry("如果后续做正式版本，希望保留匿名反馈入口。不是每个人都愿意留下联系方式，但很多细节其实可以帮助你们改产品。", "深圳"),
            Map.entry("Sometimes I only wanted to write one messy paragraph and leave. It helped that the product didn't make me label everything before I could continue.", "多伦多")
    );
    private static final List<String> DISPLAY_REGION_ORDER = List.of(
            "北京",
            "上海",
            "广州",
            "成都",
            "深圳",
            "杭州",
            "武汉",
            "纽约",
            "多伦多"
    );
    private static final Set<String> ALLOWED_RATINGS = Set.of("very", "some", "unsure");
    private static final Set<String> ALLOWED_FEEDBACK_TYPES = Set.of(
            "不保存记录",
            "隐私安全",
            "考试压力",
            "被理解",
            "情绪表达",
            "语音聊天",
            "其他"
    );

    private final ResearchFeedbackMapper researchFeedbackMapper;
    private final UserMapper userMapper;
    private final RateLimitService rateLimitService;
    private final HashUtils hashUtils;

    public ResearchFeedbackService(
            ResearchFeedbackMapper researchFeedbackMapper,
            UserMapper userMapper,
            RateLimitService rateLimitService,
            HashUtils hashUtils
    ) {
        this.researchFeedbackMapper = researchFeedbackMapper;
        this.userMapper = userMapper;
        this.rateLimitService = rateLimitService;
        this.hashUtils = hashUtils;
    }

    public ResearchFeedbackSubmitResponse submit(
            AuthenticatedUser currentUser,
            String clientIp,
            ResearchFeedbackSubmitRequest request
    ) {
        String rating = normalizeRating(request.rating());
        String feedbackText = normalizeFeedbackText(request.feedbackText());
        String feedbackType = normalizeFeedbackTypes(request.feedbackTypes());

        Long userId = currentUser == null ? null : currentUser.userId();
        checkRateLimit(userId, clientIp);

        ResearchFeedback feedback = new ResearchFeedback();
        feedback.setUserId(userId);
        feedback.setRating(rating);
        feedback.setFeedbackType(feedbackType);
        feedback.setFeedbackText(feedbackText);
        feedback.setApproved(false);
        feedback.setReviewStatus(AdminResearchFeedbackService.STATUS_PENDING);
        researchFeedbackMapper.insert(feedback);

        return new ResearchFeedbackSubmitResponse(true, false);
    }

    private void checkRateLimit(Long userId, String clientIp) {
        if (userId != null) {
            String userHash = hashUtils.sha256WithConfiguredSalt(String.valueOf(userId));
            rateLimitService.checkAllowed("user", userHash, FEEDBACK_ENDPOINT, MAX_FEEDBACK_PER_WINDOW, FEEDBACK_WINDOW);
            return;
        }

        String ipHash = hashUtils.sha256WithConfiguredSalt(clientIp == null ? "" : clientIp);
        rateLimitService.checkAllowed("ip", ipHash, FEEDBACK_ENDPOINT, MAX_FEEDBACK_PER_WINDOW, FEEDBACK_WINDOW);
    }

    public List<ApprovedResearchFeedbackResponse> listApproved() {
        return researchFeedbackMapper.selectList(
                        Wrappers.lambdaQuery(ResearchFeedback.class)
                                .eq(ResearchFeedback::getApproved, true)
                                .eq(ResearchFeedback::getReviewStatus, AdminResearchFeedbackService.STATUS_APPROVED)
                                .and(query -> query
                                        .isNotNull(ResearchFeedback::getRedactedText)
                                        .or()
                                        .isNotNull(ResearchFeedback::getDisplayText)
                                )
                                .orderByDesc(ResearchFeedback::getCreatedAt)
                                .last("LIMIT " + APPROVED_FEEDBACK_LIMIT)
                )
                .stream()
                .filter(feedback -> publicFeedbackText(feedback) != null && !publicFeedbackText(feedback).isBlank())
                .map(feedback -> new ApprovedResearchFeedbackResponse(
                        publicFeedbackText(feedback),
                        feedback.getFeedbackType() == null ? "" : feedback.getFeedbackType(),
                        feedback.getRating(),
                        displayRegionFor(publicFeedbackText(feedback))
                ))
                .toList();
    }

    public ResearchFeedbackMetricsResponse metrics() {
        List<String> regions = approvedDisplayRegions();
        long userCount = userMapper.selectCount(
                Wrappers.lambdaQuery(User.class)
                        .eq(User::getStatus, "active")
        );
        long approvedFeedbackCount = researchFeedbackMapper.selectCount(
                Wrappers.lambdaQuery(ResearchFeedback.class)
                        .eq(ResearchFeedback::getApproved, true)
                        .eq(ResearchFeedback::getReviewStatus, AdminResearchFeedbackService.STATUS_APPROVED)
                        .and(query -> query
                                .isNotNull(ResearchFeedback::getRedactedText)
                                .or()
                                .isNotNull(ResearchFeedback::getDisplayText)
                        )
        );
        long totalFeedbackCount = researchFeedbackMapper.selectCount(
                Wrappers.lambdaQuery(ResearchFeedback.class)
        );

        return new ResearchFeedbackMetricsResponse(
                userCount,
                approvedFeedbackCount,
                regions.size(),
                totalFeedbackCount > 0 ? 100 : 0,
                regions
        );
    }

    private List<String> approvedDisplayRegions() {
        Set<String> approvedRegions = researchFeedbackMapper.selectList(
                        Wrappers.lambdaQuery(ResearchFeedback.class)
                                .eq(ResearchFeedback::getApproved, true)
                                .eq(ResearchFeedback::getReviewStatus, AdminResearchFeedbackService.STATUS_APPROVED)
                                .and(query -> query
                                        .isNotNull(ResearchFeedback::getRedactedText)
                                        .or()
                                        .isNotNull(ResearchFeedback::getDisplayText)
                                )
                )
                .stream()
                .map(this::publicFeedbackText)
                .filter(text -> text != null && !text.isBlank())
                .filter(DISPLAY_REGION_BY_SEED_FEEDBACK::containsKey)
                .map(DISPLAY_REGION_BY_SEED_FEEDBACK::get)
                .collect(Collectors.toSet());

        return DISPLAY_REGION_ORDER.stream()
                .filter(approvedRegions::contains)
                .toList();
    }

    private String displayRegionFor(String feedbackText) {
        return DISPLAY_REGION_BY_SEED_FEEDBACK.getOrDefault(feedbackText, "匿名");
    }

    private String publicFeedbackText(ResearchFeedback feedback) {
        if (feedback.getRedactedText() != null && !feedback.getRedactedText().isBlank()) {
            return feedback.getRedactedText();
        }
        return feedback.getDisplayText();
    }

    private String normalizeRating(String rating) {
        if (rating == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        String normalized = rating.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_RATINGS.contains(normalized)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return normalized;
    }

    private String normalizeFeedbackText(String feedbackText) {
        String normalized = feedbackText == null ? "" : feedbackText.strip();
        if (normalized.isBlank() || charLength(normalized) > FEEDBACK_TEXT_MAX_LENGTH) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return normalized;
    }

    private String normalizeFeedbackTypes(List<String> feedbackTypes) {
        if (feedbackTypes == null || feedbackTypes.isEmpty()) {
            return null;
        }

        LinkedHashSet<String> normalizedTypes = new LinkedHashSet<>();
        for (String feedbackType : feedbackTypes) {
            if (feedbackType == null) {
                throw new BusinessException(ErrorCode.BAD_REQUEST);
            }
            String normalized = feedbackType.strip();
            if (!ALLOWED_FEEDBACK_TYPES.contains(normalized)) {
                throw new BusinessException(ErrorCode.BAD_REQUEST);
            }
            normalizedTypes.add(normalized);
        }

        if (normalizedTypes.isEmpty()) {
            return null;
        }

        String joined = String.join(",", normalizedTypes);
        if (joined.length() > 64) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return joined;
    }

    private int charLength(String value) {
        return value.codePointCount(0, value.length());
    }
}
