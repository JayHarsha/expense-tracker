package com.trackage.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDetailDTO {
    private Long id;
    private String name;
    private String inviteCode;
    private Long createdByUserId;
    private List<UserSummaryDTO> members;
}
