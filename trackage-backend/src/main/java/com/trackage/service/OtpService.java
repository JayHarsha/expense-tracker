package com.trackage.service;

import com.trackage.entity.OtpCode;
import com.trackage.entity.User;
import com.trackage.repository.OtpCodeRepository;
import com.trackage.security.HashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final EmailService emailService;

    private static final SecureRandom RANDOM = new SecureRandom();
    public static final int TTL_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;

    @Transactional
    public Instant issue(User user, OtpCode.OtpPurpose purpose) {
        otpCodeRepository.findByUser_IdAndPurposeAndConsumedFalse(user.getId(), purpose)
                .forEach(o -> o.setConsumed(true));

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        Instant expiresAt = Instant.now().plus(TTL_MINUTES, ChronoUnit.MINUTES);
        OtpCode otp = OtpCode.builder()
                .user(user)
                .codeHash(HashUtil.sha256Hex(code))
                .purpose(purpose)
                .expiresAt(expiresAt)
                .build();
        otpCodeRepository.save(otp);
        emailService.sendOtp(user.getEmail(), code, purpose, TTL_MINUTES);
        return expiresAt;
    }

    @Transactional
    public void verify(User user, String code, OtpCode.OtpPurpose purpose) {
        OtpCode otp = otpCodeRepository
                .findTopByUser_IdAndPurposeAndConsumedFalseOrderByCreatedAtDesc(user.getId(), purpose)
                .orElseThrow(() -> new IllegalArgumentException("No verification code found. Please request a new one."));

        if (otp.getExpiresAt().isBefore(Instant.now())) {
            otp.setConsumed(true);
            throw new IllegalArgumentException("Code expired. Please request a new one.");
        }
        if (otp.getAttempts() >= MAX_ATTEMPTS) {
            otp.setConsumed(true);
            throw new IllegalArgumentException("Too many attempts. Please request a new code.");
        }
        if (!otp.getCodeHash().equals(HashUtil.sha256Hex(code))) {
            otp.setAttempts(otp.getAttempts() + 1);
            throw new IllegalArgumentException("Incorrect code");
        }
        otp.setConsumed(true);
    }
}
