package com.trackage.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequestDTO {
    /** Null means "leave unchanged". */
    @Size(min = 1, max = 100)
    private String name;

    /** Null means "leave unchanged"; empty string clears the picture. ~200KB cap on the data URL. */
    @Size(max = 200_000)
    private String avatar;
}
