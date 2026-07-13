package com.trackage.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettleUpRequestDTO {
    @NotNull
    private Long groupId;
    @NotNull
    private Long payerId;
    @NotNull
    private Long receiverId;
    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;
    private LocalDate date; // optional
}
