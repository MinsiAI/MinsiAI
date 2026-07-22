package ai.minsi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.util.StringUtils;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender(MinsiProperties properties) {
        MinsiProperties.Mail mail = properties.getMail();
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        if (StringUtils.hasText(mail.getSmtpHost())) {
            sender.setHost(mail.getSmtpHost().trim());
        }
        if (mail.getSmtpPort() != null) {
            sender.setPort(mail.getSmtpPort());
        }
        if (StringUtils.hasText(mail.getSmtpUsername())) {
            sender.setUsername(mail.getSmtpUsername().trim());
        }
        if (StringUtils.hasText(mail.getSmtpPassword())) {
            sender.setPassword(mail.getSmtpPassword());
        }

        Properties javaMailProperties = sender.getJavaMailProperties();
        javaMailProperties.put("mail.transport.protocol", "smtp");
        javaMailProperties.put("mail.smtp.auth", Boolean.toString(StringUtils.hasText(mail.getSmtpUsername())));
        javaMailProperties.put("mail.smtp.starttls.enable", Boolean.toString(mail.isSmtpStartTlsEnabled()));
        javaMailProperties.put("mail.smtp.ssl.enable", Boolean.toString(mail.isSmtpSslEnabled()));
        javaMailProperties.put("mail.smtp.connectiontimeout", Integer.toString(mail.getSmtpConnectionTimeoutMs()));
        javaMailProperties.put("mail.smtp.timeout", Integer.toString(mail.getSmtpReadTimeoutMs()));
        javaMailProperties.put("mail.smtp.writetimeout", Integer.toString(mail.getSmtpWriteTimeoutMs()));
        return sender;
    }
}
