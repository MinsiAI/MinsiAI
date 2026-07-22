package ai.minsi.client;

public class MockEmailClient implements EmailClient {

    @Override
    public void sendVerificationCode(String email, String code) {
    }
}
