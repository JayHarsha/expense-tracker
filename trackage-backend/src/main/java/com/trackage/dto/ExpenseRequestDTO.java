package com.trackage.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseRequestDTO {
    @NotNull
    private Long groupId;
    @NotNull
    private Long paidByUserId;
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal amount;
    private String description;
    @NotNull
    private Long categoryId;
    private LocalDate date; // optional

    @NotEmpty
    private List<Split> splits;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Split {
        @NotNull
        private Long userId;
        @NotNull
        @DecimalMin(value = "0.00")
        private BigDecimal amount;
    }
}
