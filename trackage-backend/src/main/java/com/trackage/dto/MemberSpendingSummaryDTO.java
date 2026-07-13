package com.trackage.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberSpendingSummaryDTO {
    private Long userId;
    private String userName;
    /** Sum of this member's expense splits in the period, excluding settlements - their true consumption share. */
    private BigDecimal share;
    /** Real cash paid out to date net of settlements received - converges to `share` once fully settled up. */
    private BigDecimal actualSpent;
}
