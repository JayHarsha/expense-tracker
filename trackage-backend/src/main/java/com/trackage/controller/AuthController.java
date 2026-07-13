package com.trackage.controller;

import com.trackage.dto.AuthResponseDTO;
import com.trackage.dto.ForgotPasswordRequestDTO;
import com.trackage.dto.LoginRequestDTO;
import com.trackage.dto.OtpIssuedResponseDTO;
import com.trackage.dto.RefreshRequestDTO;
import com.trackage.dto.ResendVerificationRequestDTO;
import com.trackage.dto.ResetPasswordRequestDTO;
import com.trackage.dto.SignupRequestDTO;
import com.trackage.dto.VerifySignupRequestDTO;
import com.trackage.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/trackage/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<OtpIssuedResponseDTO> signup(@Valid @RequestBody SignupRequestDTO req) {
        return ResponseEntity.ok(authService.signup(req));
    }

    @PostMapping("/verify-signup")
    public ResponseEntity<AuthResponseDTO> verifySignup(@Valid @RequestBody VerifySignupRequestDTO req) {
        return ResponseEntity.ok(authService.verifySignup(req.getEmail(), req.getCode()));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<OtpIssuedResponseDTO> resendVerification(@Valid @RequestBody ResendVerificationRequestDTO req) {
        return ResponseEntity.ok(authService.resendVerification(req.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<OtpIssuedResponseDTO> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO req) {
        return ResponseEntity.ok(authService.forgotPassword(req.getEmail()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO req) {
        authService.resetPassword(req.getEmail(), req.getCode(), req.getNewPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshRequestDTO req) {
        return ResponseEntity.ok(authService.refresh(req.getRefreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequestDTO req) {
        authService.logout(req.getRefreshToken());
        return ResponseEntity.noContent().build();
    }
}
