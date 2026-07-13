package com.trackage.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BalanceResponseDTO {
    private Long userId;
    private String userName;
    private BigDecimal balance;
}
