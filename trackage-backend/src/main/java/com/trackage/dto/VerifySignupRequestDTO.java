package com.trackage.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifySignupRequestDTO {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String code;
}
