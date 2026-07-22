package ai.minsi.service;

import ai.minsi.client.AiClient;
import ai.minsi.client.AiResult;
import ai.minsi.client.VoiceSpeechClient;
import ai.minsi.client.VoiceSpeechResult;
import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.dto.chat.ChatRequest;
import ai.minsi.dto.chat.ChatResponse;
import ai.minsi.dto.chat.ChatTurn;
import ai.minsi.dto.chat.SafetyLevel;
import ai.minsi.mapper.SafetyEventMapper;
import ai.minsi.security.AuthenticatedUser;
import ai.minsi.util.HashUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ChatServiceTest {

    private static final String HASH_SALT = "test-salt";

    @Test
    void voiceModeReturnsSynthesizedAudio() {
        ChatService service = newChatService(text -> new VoiceSpeechResult("audio/wav", new byte[]{1, 2, 3}));

        ChatResponse response = service.chat(currentUser(), new ChatRequest("x", List.of(), true));

        assertThat(response.reply()).isEqualTo("y.");
        assertThat(response.replyAudioContentType()).isEqualTo("audio/wav");
        assertThat(response.replyAudioBase64()).isEqualTo("AQID");
    }

    @Test
    void voiceL3KeepsTheEmergencyReplyAndSynthesizesIt() {
        ChatService service = newChatService(
                prompt -> {
                    throw new AssertionError("AI provider must not be called for an L3 safety message");
                },
                text -> new VoiceSpeechResult("audio/wav", new byte[]{1, 2, 3})
        );

        ChatResponse response = service.chat(
                currentUser(),
                new ChatRequest("我已经把药吃下去了", List.of(), true)
        );

        assertThat(response.reply())
                .startsWith("我听见了，这很紧急")
                .contains("立刻放下危险物")
                .contains("当地急救或报警")
                .contains("不要独处");
        assertThat(response.safetyLevel()).isEqualTo(SafetyLevel.CRISIS);
        assertThat(response.replyAudioBase64()).isEqualTo("AQID");
    }

    @Test
    void voiceModeFailsWhenSpeechClientReturnsNoAudio() {
        ChatService service = newChatService(text -> VoiceSpeechResult.empty());

        assertThatThrownBy(() -> service.chat(currentUser(), new ChatRequest("x", List.of(), true)))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.VOICE_UNAVAILABLE);
    }

    @Test
    void textModeStreamsReplyAsSseWithoutWaitingForJsonEnvelope() throws Exception {
        ChatService service = newChatService(text -> VoiceSpeechResult.empty());
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        service.streamChat(currentUser(), new ChatRequest("x", List.of(), false)).writeTo(outputStream);

        String stream = outputStream.toString(StandardCharsets.UTF_8);
        assertThat(stream)
                .contains("event: ready")
                .contains("event: delta")
                .contains("\"text\":\"y.\"")
                .contains("event: done")
                .contains("\"safetyLevel\":\"normal\"");
    }

    @Test
    void textStreamStopsAtTheUnicodeSafeReplyLimit() throws Exception {
        String longReply = "🙂".repeat(200);
        ChatService service = newChatService(
                prompt -> new AiResult(longReply, SafetyLevel.NORMAL, List.of()),
                text -> VoiceSpeechResult.empty()
        );
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        service.streamChat(currentUser(), new ChatRequest("x", List.of(), false)).writeTo(outputStream);

        String stream = outputStream.toString(StandardCharsets.UTF_8);
        assertThat(stream).contains("…");
        assertThat(stream.codePoints().filter(codePoint -> codePoint == 0x1F642).count()).isEqualTo(139);
    }

    @Test
    void textStreamReturnsAClientSafeErrorEventWhenTheAiProviderFails() throws Exception {
        ChatService service = newChatService(
                prompt -> {
                    throw new BusinessException(ErrorCode.INTERNAL_ERROR);
                },
                text -> VoiceSpeechResult.empty()
        );
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        service.streamChat(currentUser(), new ChatRequest("x", List.of(), false)).writeTo(outputStream);

        String stream = outputStream.toString(StandardCharsets.UTF_8);
        assertThat(stream)
                .contains("event: ready")
                .contains("event: error")
                .contains("\"code\":\"INTERNAL_ERROR\"")
                .doesNotContain("BusinessException", "ai.minsi", "x");
    }

    @Test
    void colloquialExaggerationStaysInNormalChat() throws Exception {
        ChatService service = newChatService(
                prompt -> new AiResult("这作业听起来真的多到让人头大。", SafetyLevel.NORMAL, List.of()),
                text -> VoiceSpeechResult.empty()
        );

        String stream = stream(service, new ChatRequest("这作业多得我要死了", List.of(), false));

        assertThat(stream)
                .contains("这作业听起来真的多到让人头大。")
                .contains("\"safetyLevel\":\"normal\"")
                .doesNotContain("当地急救", "马上会伤害自己");
    }

    @Test
    void l1StreamsOneGentleCheckWithoutCallingTheAiProvider() throws Exception {
        ChatService service = newChatService(
                prompt -> {
                    throw new AssertionError("AI provider must not be called for an L1 safety message");
                },
                text -> VoiceSpeechResult.empty()
        );

        String stream = stream(service, new ChatRequest("活着好没意思", List.of(), false));

        assertThat(stream)
                .contains("听起来你这会儿真的挺累的")
                .contains("还是已经有一阵了")
                .contains("\"safetyLevel\":\"elevated\"")
                .doesNotContain("当地急救", "报警", "伤害自己");
    }

    @Test
    void firstExplicitL2SignalStreamsCrisisReplyWithoutWaitingOrCallingTheAiProvider() throws Exception {
        ChatService service = newChatService(
                prompt -> {
                    throw new AssertionError("AI provider must not be called for a crisis message");
                },
                text -> VoiceSpeechResult.empty()
        );

        for (String message : List.of(
                "我真的好想死",
                "我不想活了",
                "想消失"
        )) {
            String stream = stream(service, new ChatRequest(message, List.of(), false));
            assertThat(stream)
                    .contains("event: delta")
                    .contains("我在，我听见你了")
                    .contains("现在真的很难撑")
                    .contains("马上会伤害自己的危险")
                    .contains("可信任的大人、监护人或老师")
                    .contains("当地急救或报警")
                    .contains("我现在有伤害自己的念头，需要有人陪着我")
                    .contains("你也可以继续跟我说")
                    .contains("\"safetyLevel\":\"crisis\"")
                    .doesNotContain("We need", "server marker", "crisis reply", "Chinese teen", "内部指令", "分析过程");
        }
    }

    @Test
    void firstL3SignalStreamsImmediateEmergencyInstructionsWithoutCallingTheAiProvider() throws Exception {
        ChatService service = newChatService(
                prompt -> {
                    throw new AssertionError("AI provider must not be called for an L3 safety message");
                },
                text -> VoiceSpeechResult.empty()
        );

        for (String message : List.of("我已经把药吃下去了", "我在流血", "我伤害了自己")) {
            String stream = stream(service, new ChatRequest(message, List.of(), false));

            assertThat(stream)
                    .contains("我听见了，这很紧急")
                    .contains("立刻把刀、药或其他危险物放远")
                    .contains("去有人的地方")
                    .contains("当地急救或报警")
                    .contains("不要独处")
                    .contains("\"safetyLevel\":\"crisis\"")
                    .doesNotContain("We need", "server marker", "crisis reply", "Chinese teen", "内部指令", "分析过程");
        }
    }

    @Test
    void l2FollowedByJustKiddingStaysInCrisisModeWithoutCallingTheAiProvider() throws Exception {
        ChatService service = newChatService(
                prompt -> {
                    throw new AssertionError("AI provider must not be called while the session remains crisis-sensitive");
                },
                text -> VoiceSpeechResult.empty()
        );
        ChatRequest request = new ChatRequest(
                "没事，我开玩笑的",
                List.of(
                        new ChatTurn("user", "我真的好想死"),
                        new ChatTurn("assistant", ChatRuntimePolicy.crisisResult(false).text())
                ),
                false
        );

        String stream = stream(service, request);

        assertThat(stream)
                .contains("不会逼你解释")
                .contains("不会把那句话当作没发生")
                .contains("你现在是安全的")
                .contains("\"safetyLevel\":\"crisis\"")
                .doesNotContain("We need", "server marker", "crisis reply", "Chinese teen", "内部指令", "分析过程");
    }

    private ChatService newChatService(VoiceSpeechClient speechClient) {
        return newChatService(
                prompt -> new AiResult("y.", SafetyLevel.NORMAL, List.of()),
                speechClient
        );
    }

    private ChatService newChatService(AiClient aiClient, VoiceSpeechClient speechClient) {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        ValueOperations<String, String> valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenReturn(1L);

        return new ChatService(
                aiClient,
                new RateLimitService(redisTemplate),
                new HashUtils(HASH_SALT),
                new SafetyEventService(mock(SafetyEventMapper.class)),
                speechClient,
                new ObjectMapper()
        );
    }

    private String stream(ChatService service, ChatRequest request) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        service.streamChat(currentUser(), request).writeTo(outputStream);
        return outputStream.toString(StandardCharsets.UTF_8);
    }

    private AuthenticatedUser currentUser() {
        return new AuthenticatedUser(7L, "child@example.com", "email", "邮箱");
    }
}
