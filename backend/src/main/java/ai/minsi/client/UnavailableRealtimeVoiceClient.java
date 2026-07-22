package ai.minsi.client;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;

public final class UnavailableRealtimeVoiceClient implements RealtimeVoiceClient {

    @Override
    public RealtimeVoiceSession createClientSecret(String safetyIdentifier) {
        throw new BusinessException(ErrorCode.VOICE_UNAVAILABLE);
    }
}
