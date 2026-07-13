package com.trackage.service;

import com.trackage.dto.AuthResponseDTO;
import com.trackage.dto.LoginRequestDTO;
import com.trackage.dto.OtpIssuedResponseDTO;
import com.trackage.dto.SignupRequestDTO;
import com.trackage.dto.UserSummaryDTO;
import com.trackage.entity.OtpCode;
import com.trackage.entity.RefreshToken;
import com.trackage.entity.User;
import com.trackage.exception.ForbiddenOperationException;
import com.trackage.exception.ResourceNotFoundException;
import com.trackage.repository.RefreshTokenRepository;
import com.trackage.repository.UserRepository;
import com.trackage.security.GoogleTokenVerifier;
import com.trackage.security.HashUtil;
import com.trackage.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final GoogleTokenVerifier googleTokenVerifier;

    @Transactional
    public OtpIssuedResponseDTO signup(SignupRequestDTO req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .emailVerified(false)
                .build();
        user = userRepository.save(user);
        Instant expiresAt = otpService.issue(user, OtpCode.OtpPurpose.SIGNUP_VERIFICATION);
        return OtpIssuedResponseDTO.builder()
                .email(user.getEmail())
                .message("We've sent a verification code to your email. Enter it to activate your account.")
                .otpExpiresAt(expiresAt)
                .build();
    }

    @Transactional
    public AuthResponseDTO verifySignup(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account with that email"));
        otpService.verify(user, code, OtpCode.OtpPurpose.SIGNUP_VERIFICATION);
        user.setEmailVerified(true);
        return issueTokens(user);
    }

    @Transactional
    public OtpIssuedResponseDTO resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account with that email"));
        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("This account is already verified");
        }
        Instant expiresAt = otpService.issue(user, OtpCode.OtpPurpose.SIGNUP_VERIFICATION);
        return OtpIssuedResponseDTO.builder()
                .email(email)
                .message("A new code has been sent.")
                .otpExpiresAt(expiresAt)
                .build();
    }

    @Transactional
    public AuthResponseDTO login(LoginRequestDTO req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account exists with that email"));
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Incorrect password");
        }
        if (!user.isEmailVerified()) {
            throw new ForbiddenOperationException("Please verify your email before logging in");
        }
        return issueTokens(user);
    }

    @Transactional
    public OtpIssuedResponseDTO forgotPassword(String email) {
        // Always returns the same shape, even if the email doesn't exist, so this
        // endpoint can't be used to enumerate registered accounts.
        Instant expiresAt = userRepository.findByEmail(email)
                .map(user -> otpService.issue(user, OtpCode.OtpPurpose.PASSWORD_RESET))
                .orElseGet(() -> Instant.now().plus(OtpService.TTL_MINUTES, ChronoUnit.MINUTES));
        return OtpIssuedResponseDTO.builder()
                .email(email)
                .message("If that email is registered, a reset code has been sent.")
                .otpExpiresAt(expiresAt)
                .build();
    }

    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account with that email"));
        otpService.verify(user, code, OtpCode.OtpPurpose.PASSWORD_RESET);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
    }

    /**
     * Sign in (or first-time sign up) with a Google ID token. If an account with the
     * same email already exists - e.g. created earlier via email+password - Google
     * login links to it rather than creating a duplicate. Google-created accounts get
     * an unguessable random password; "forgot password" still works to set a real one.
     */
    @Transactional
    public AuthResponseDTO googleLogin(String idToken) {
        Jwt token = googleTokenVerifier.verify(idToken);
        String email = token.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google token is missing an email");
        }
        if (!Boolean.TRUE.equals(token.getClaimAsBoolean("email_verified"))) {
            throw new ForbiddenOperationException("Google account email is not verified");
        }
        String name = token.getClaimAsString("name");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = userRepository.save(User.builder()
                    .name(name != null && !name.isBlank() ? name : email)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(generateOpaqueToken()))
                    .emailVerified(true)
                    .build());
        } else {
            // Google already verified this email, so an unverified signup becomes usable.
            user.setEmailVerified(true);
        }
        return issueTokens(user);
    }

    @Transactional
    public AuthResponseDTO refresh(String rawRefreshToken) {
        RefreshToken stored = refreshTokenRepository.findByTokenHash(HashUtil.sha256Hex(rawRefreshToken))
                .orElseThrow(() -> new ForbiddenOperationException("Invalid refresh token"));
        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            throw new ForbiddenOperationException("Refresh token expired or revoked");
        }
        stored.setRevoked(true);
        return issueTokens(stored.getUser());
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenRepository.findByTokenHash(HashUtil.sha256Hex(rawRefreshToken))
                .ifPresent(t -> t.setRevoked(true));
    }

    private AuthResponseDTO issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String rawRefreshToken = generateOpaqueToken();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(HashUtil.sha256Hex(rawRefreshToken))
                .expiresAt(Instant.now().plus(jwtService.getRefreshTokenTtlDays(), ChronoUnit.DAYS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
        return AuthResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .user(UserSummaryDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .avatar(user.getAvatar())
                        .build())
                .build();
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[48];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
