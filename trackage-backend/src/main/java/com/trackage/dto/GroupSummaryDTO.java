package com.trackage.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupSummaryDTO {
    private Long id;
    private String name;
    private String inviteCode;
}
