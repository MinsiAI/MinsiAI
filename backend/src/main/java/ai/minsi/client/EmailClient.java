package ai.minsi.client;

public interface EmailClient {

    void sendVerificationCode(String email, String code);
}
