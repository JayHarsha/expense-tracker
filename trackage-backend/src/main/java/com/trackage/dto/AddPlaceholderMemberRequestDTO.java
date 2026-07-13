package com.trackage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddPlaceholderMemberRequestDTO {
    @NotBlank
    @Size(max = 100)
    private String name;
}
