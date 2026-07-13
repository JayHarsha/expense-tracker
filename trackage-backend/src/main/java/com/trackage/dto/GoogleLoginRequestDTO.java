package com.trackage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequestDTO {
    @NotBlank
    private String idToken;
}
