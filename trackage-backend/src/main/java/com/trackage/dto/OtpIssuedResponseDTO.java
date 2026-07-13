package com.trackage.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpIssuedResponseDTO {
    private String email;
    private String message;
    private Instant otpExpiresAt;
}
