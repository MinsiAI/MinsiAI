package ai.minsi.client;

import ai.minsi.dto.chat.ChatTurn;
import ai.minsi.dto.chat.SafetyLevel;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

public final class SafetyClassifier {

    private static final Set<String> L1_TERMS = Set.of(
            "活着好累",
            "活着太累",
            "活着真累",
            "活得好累",
            "活着没意思",
            "活着好没意思",
            "活着没劲",
            "人生没意思",
            "什么都没意思",
            "不想醒来",
            "不想再醒来",
            "希望睡着不醒",
            "不想面对明天",
            "每天都没意义"
    );

    private static final Set<String> L2_TERMS = Set.of(
            "想死",
            "想去死",
            "不想活",
            "活不下去",
            "想消失",
            "结束生命",
            "杀了自己",
            "杀死自己",
            "自杀",
            "轻生",
            "自伤",
            "伤害自己",
            "弄伤自己",
            "割伤自己",
            "suicide",
            "killmyself",
            "selfharm"
    );

    private static final Set<String> OTHER_CRISIS_TERMS = Set.of(
            "家庭暴力",
            "家暴",
            "性侵",
            "性胁迫",
            "强奸",
            "猥亵",
            "校园暴力",
            "校园欺凌",
            "霸凌",
            "被成年人诱导",
            "被威胁",
            "威胁我",
            "人身危险",
            "严重身体不适",
            "伤害别人"
    );

    private static final Set<String> GENERAL_ELEVATED_TERMS = Set.of(
            "崩溃",
            "害怕",
            "焦虑",
            "难过",
            "生气",
            "紧张",
            "低落",
            "失眠",
            "撑不住",
            "受不了",
            "很痛苦"
    );

    private static final Set<String> AMBIGUOUS_ESCALATION_TERMS = Set.of(
            "撑不住",
            "受不了了",
            "算了吧",
            "不想继续了",
            "没意义了",
            "不想醒",
            "消失算了",
            "结束算了",
            "就这样吧"
    );

    private static final Set<String> RISK_MINIMIZATION_TERMS = Set.of(
            "我没事",
            "没事了",
            "开玩笑的",
            "开个玩笑",
            "逗你的",
            "闹着玩",
            "不用管我",
            "我很好"
    );

    private static final Set<String> ASSISTANT_HIGH_SENSITIVITY_MARKERS = Set.of(
            "别一个人等我回复",
            "不要只等我回复",
            "不会把那句话当作没发生",
            "继续把安全放在前面"
    );

    private static final Pattern COLLOQUIAL_EXAGGERATION = Pattern.compile(
            "(累死了?|笑死了?|吓死了?|烦死了?|困死了?|饿死了?|热死了?|冷死了?|气死了?|忙死了?|"
                    + "作业.{0,10}(要死|要命)|.{0,10}多得我要死了?|要我命了?|真要命)"
    );
    private static final Pattern THIRD_PERSON_SIGNAL = Pattern.compile(
            "(他|她|他们|她们|同学|朋友|网友|别人|主角|角色|患者|案例里的人).{0,16}"
                    + "(想死|想去死|不想活|想消失|自杀|轻生|自伤|伤害自己)"
    );
    private static final Pattern FICTIONAL_OR_ACADEMIC_CONTEXT = Pattern.compile(
            "(小说|电影|电视剧|剧情|角色|作文|题目|论文|研究|学术|课堂|定义|新闻|案例|讨论).{0,24}"
                    + "(想死|不想活|想消失|自杀|轻生|自伤|伤害自己)"
    );
    private static final Pattern CLEAR_PERSONAL_CONTEXT = Pattern.compile(
            "我(也(?:想死|不想活|想消失|自伤|自杀)|自己|现在|真的|特别|一直|已经|正在|准备|打算|计划|决定|马上|刚刚|刚才)"
    );
    private static final Pattern L3_IN_PROGRESS = Pattern.compile(
            "(我)?(正在|已经|刚刚|刚才|刚).{0,12}"
                    + "(自伤|伤害了?自己|弄伤了?自己|割伤了?自己|割腕|割手|吞了?药|吃了.{0,4}药|喝了.{0,4}(毒|农药)|跳楼|上吊|流血)"
    );
    private static final Pattern L3_PLAN_OR_TIME = Pattern.compile(
            "我.{0,10}(今晚|明天|待会|等会|马上|现在|准备|打算|计划|决定|就要).{0,16}"
                    + "(想死|去死|自杀|轻生|跳楼|割腕|割手|吞药|吃药|上吊)"
    );
    private static final Pattern L3_MEANS_AVAILABLE = Pattern.compile(
            "我.{0,12}(拿着刀|手里有刀|药准备好了|把.{0,4}药.{0,4}(吃|吞)|在楼顶|在天台|在桥边|在轨道旁|绳子准备好了)"
    );
    private static final Pattern L3_TIME_BEFORE_ACTION = Pattern.compile(
            "(今晚|明天|待会|等会|马上|现在).{0,16}(想死|去死|自杀|轻生|跳楼|割腕|割手|吞药|吃药|上吊)"
    );

    private SafetyClassifier() {
    }

    public static SafetyLevel classify(String text) {
        return assess(text, List.of()).safetyLevel();
    }

    public static Assessment assess(String text, List<ChatTurn> recentTurns) {
        String normalized = normalize(text);
        SignalLevel currentLevel = classifyCurrentSignal(normalized);
        boolean priorAttention = false;
        boolean priorCrisis = false;

        if (recentTurns != null) {
            for (ChatTurn turn : recentTurns) {
                if (turn == null || turn.content() == null) {
                    continue;
                }

                String role = turn.role() == null ? "" : turn.role().toLowerCase(Locale.ROOT);
                String turnText = normalize(turn.content());
                if ("user".equals(role)) {
                    SignalLevel previousLevel = classifyCurrentSignal(turnText);
                    priorAttention |= previousLevel == SignalLevel.L1;
                    priorCrisis |= previousLevel == SignalLevel.L2 || previousLevel == SignalLevel.L3;
                } else if ("assistant".equals(role)) {
                    priorCrisis |= containsAny(turnText, ASSISTANT_HIGH_SENSITIVITY_MARKERS);
                }
            }
        }

        SignalLevel effectiveLevel = currentLevel;
        if (currentLevel != SignalLevel.L3 && priorCrisis) {
            effectiveLevel = SignalLevel.L2;
        } else if (priorAttention
                && (currentLevel == SignalLevel.L1 || containsAny(normalized, AMBIGUOUS_ESCALATION_TERMS))) {
            effectiveLevel = SignalLevel.L2;
        }

        SafetyLevel safetyLevel;
        if (effectiveLevel == SignalLevel.L2 || effectiveLevel == SignalLevel.L3) {
            safetyLevel = SafetyLevel.CRISIS;
        } else if (effectiveLevel == SignalLevel.L1 || containsAny(normalized, GENERAL_ELEVATED_TERMS)) {
            safetyLevel = SafetyLevel.ELEVATED;
        } else {
            safetyLevel = SafetyLevel.NORMAL;
        }

        return new Assessment(
                currentLevel,
                effectiveLevel,
                safetyLevel,
                priorAttention,
                priorCrisis,
                containsAny(normalized, RISK_MINIMIZATION_TERMS)
        );
    }

    private static SignalLevel classifyCurrentSignal(String text) {
        if (text.isBlank()) {
            return SignalLevel.L0;
        }

        boolean clearPersonalContext = CLEAR_PERSONAL_CONTEXT.matcher(text).find();
        if ((THIRD_PERSON_SIGNAL.matcher(text).find() || FICTIONAL_OR_ACADEMIC_CONTEXT.matcher(text).find())
                && !clearPersonalContext) {
            return SignalLevel.L0;
        }
        if (L3_IN_PROGRESS.matcher(text).find()
                || L3_PLAN_OR_TIME.matcher(text).find()
                || L3_MEANS_AVAILABLE.matcher(text).find()
                || L3_TIME_BEFORE_ACTION.matcher(text).find()
                || text.contains("我在流血")
                || text.contains("流了很多血")
                || text.contains("我伤害了自己")) {
            return SignalLevel.L3;
        }
        if (COLLOQUIAL_EXAGGERATION.matcher(text).find() && !containsAny(text, L2_TERMS)) {
            return SignalLevel.L0;
        }
        if (containsAny(text, L2_TERMS) || containsAny(text, OTHER_CRISIS_TERMS)) {
            return SignalLevel.L2;
        }
        if (containsAny(text, L1_TERMS)) {
            return SignalLevel.L1;
        }
        return SignalLevel.L0;
    }

    private static String normalize(String text) {
        if (text == null) {
            return "";
        }
        return text.toLowerCase(Locale.ROOT)
                .replaceAll("[\\s，。！？!?、；;：:“”‘’'\"（）()【】\\[\\]《》…]+", "");
    }

    private static boolean containsAny(String text, Set<String> terms) {
        return terms.stream().anyMatch(text::contains);
    }

    public enum SignalLevel {
        L0,
        L1,
        L2,
        L3
    }

    public record Assessment(
            SignalLevel currentLevel,
            SignalLevel effectiveLevel,
            SafetyLevel safetyLevel,
            boolean priorAttention,
            boolean priorCrisis,
            boolean riskMinimization
    ) {
        public boolean requiresFixedResponse() {
            return effectiveLevel != SignalLevel.L0;
        }
    }
}
