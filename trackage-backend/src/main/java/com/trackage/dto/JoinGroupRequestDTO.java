package com.trackage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JoinGroupRequestDTO {
    @NotBlank
    private String inviteCode;
}
