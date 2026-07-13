package com.trackage.service;

import com.trackage.entity.OtpCode;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * In "console" mode (default, no SMTP account required) the OTP is just logged, so the
 * signup/reset flows are fully testable before any real mailbox is configured. Switch
 * app.otp.mode to "smtp" once SMTP_HOST/SMTP_USERNAME/SMTP_PASSWORD are set to real values.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String BRAND_COLOR = "#147d64";

    private final JavaMailSender mailSender;
    private final String mode;

    public EmailService(JavaMailSender mailSender, @Value("${app.otp.mode}") String mode) {
        this.mailSender = mailSender;
        this.mode = mode;
    }

    public void sendOtp(String toEmail, String code, OtpCode.OtpPurpose purpose, int ttlMinutes) {
        boolean isSignup = purpose == OtpCode.OtpPurpose.SIGNUP_VERIFICATION;
        String subject = isSignup ? "Verify your Trackage account" : "Reset your Trackage password";
        String intro = isSignup
                ? "Use the code below to verify your email and activate your Trackage account."
                : "Use the code below to reset your Trackage password.";

        if ("smtp".equalsIgnoreCase(mode)) {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(buildHtml(intro, code, ttlMinutes), true);
                mailSender.send(mimeMessage);
            } catch (jakarta.mail.MessagingException e) {
                throw new IllegalStateException("Could not send email", e);
            }
        } else {
            log.info("[DEV OTP] {} code for {}: {} (expires in {} min)", purpose, toEmail, code, ttlMinutes);
        }
    }

    private String buildHtml(String intro, String code, int ttlMinutes) {
        return """
                <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;">
                  <p style="font-size:20px;font-weight:700;color:%s;margin:0 0 24px;">Trackage</p>
                  <p style="font-size:15px;color:#1e293b;margin:0 0 20px;line-height:1.5;">%s</p>
                  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;text-align:center;margin-bottom:20px;">
                    <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:%s;">%s</span>
                  </div>
                  <p style="font-size:14px;color:#64748b;margin:0 0 4px;">This code expires in %d minutes.</p>
                  <p style="font-size:13px;color:#94a3b8;margin-top:28px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
                """.formatted(BRAND_COLOR, intro, BRAND_COLOR, code, ttlMinutes);
    }
}
