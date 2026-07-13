package com.trackage.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalSpendingSummaryDTO {
    private BigDecimal share;
    private BigDecimal actualSpent;
    /** Sum of balances across all of the user's groups - positive means overall owed to them. */
    private BigDecimal netBalance;
}
