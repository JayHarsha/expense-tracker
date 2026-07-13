package com.trackage.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryDTO {
    private Long id;
    private String name;
    private String email;
    private String avatar;

    // Jackson strips the "is" prefix from boolean getters by default (isPlaceholder()
    // -> "placeholder"); pin the wire name so it matches the frontend's UserSummary type.
    @JsonProperty("isPlaceholder")
    private boolean isPlaceholder;
}
