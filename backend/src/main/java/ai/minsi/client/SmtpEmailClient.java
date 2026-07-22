package ai.minsi.client;

import ai.minsi.config.MinsiProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

@Component
public class SmtpEmailClient implements EmailClient {

    private static final String SUBJECT = "Minsi 登录验证码";

    private final JavaMailSender mailSender;
    private final MinsiProperties.Mail mailProperties;

    public SmtpEmailClient(JavaMailSender mailSender, MinsiProperties properties) {
        this.mailSender = mailSender;
        this.mailProperties = properties.getMail();
    }

    @Override
    public void sendVerificationCode(String email, String code) {
        requireSmtpConfigured();
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );
            helper.setFrom(mailProperties.requireSmtpFromAddress(), mailProperties.normalizedSmtpFromName());
            helper.setTo(email);
            helper.setSubject(SUBJECT);
            helper.setText(buildPlainText(code), buildHtmlText(code));
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException exception) {
            throw new IllegalStateException("EMAIL_MESSAGE_BUILD_FAILED", exception);
        } catch (MailException exception) {
            throw new IllegalStateException("EMAIL_DELIVERY_FAILED", exception);
        }
    }

    private void requireSmtpConfigured() {
        mailProperties.requireSmtpHost();
        mailProperties.requireSmtpPort();
        mailProperties.requireSmtpUsername();
        mailProperties.requireSmtpPassword();
        mailProperties.requireSmtpFromAddress();
    }

    private String buildPlainText(String code) {
        return """
                Minsi 登录验证码

                %s

                这个验证码 10 分钟内有效。请不要转发给任何人。

                如果这不是你本人操作，可以忽略这封邮件。
                """.formatted(code);
    }

    private String buildHtmlText(String code) {
        String safeCode = escapeHtml(code);
        return """
                <!doctype html>
                <html lang="zh-CN">
                <body style="margin:0;padding:0;background:#f7f5ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',Arial,sans-serif;color:#22254a;">
                  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#f7f5ff;margin:0;padding:32px 16px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #e4e0ff;border-radius:22px;box-shadow:0 16px 40px rgba(95,77,170,0.12);overflow:hidden;">
                          <tr>
                            <td style="padding:28px 30px 12px 30px;text-align:left;">
                              <div style="font-size:14px;line-height:20px;font-weight:700;color:#7b6cff;letter-spacing:0.04em;">Minsi</div>
                              <h1 style="margin:10px 0 0 0;font-size:24px;line-height:32px;font-weight:750;color:#25285f;">登录验证码</h1>
                              <p style="margin:10px 0 0 0;font-size:15px;line-height:24px;color:#62658a;">请在登录页面输入下面的验证码。</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:18px 30px 8px 30px;">
                              <div style="background:#f2f0ff;border:1px solid #dcd6ff;border-radius:18px;padding:22px 18px;text-align:center;">
                                <div style="font-size:12px;line-height:18px;font-weight:700;color:#7b6cff;letter-spacing:0.1em;text-transform:uppercase;">Verification Code</div>
                                <div style="margin-top:10px;font-size:36px;line-height:44px;font-weight:800;letter-spacing:8px;color:#20235a;">%s</div>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:14px 30px 30px 30px;text-align:left;">
                              <p style="margin:0;font-size:15px;line-height:24px;color:#373a68;">这个验证码 <strong style="font-weight:750;color:#20235a;">10 分钟内有效</strong>。请不要转发给任何人。</p>
                              <p style="margin:12px 0 0 0;font-size:13px;line-height:22px;color:#8588a8;">如果这不是你本人操作，可以忽略这封邮件。</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(safeCode);
    }

    private String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
