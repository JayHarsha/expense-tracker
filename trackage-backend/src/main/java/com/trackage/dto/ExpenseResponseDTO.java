package com.trackage.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponseDTO {
    private Long id;
    private Long groupId;
    private Long paidByUserId;
    private String paidByName;
    private BigDecimal amount;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
    private LocalDate date;
    private Instant createdAt;
    private List<SplitView> splits;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SplitView {
        private Long userId;
        private String userName;
        private BigDecimal amount;
    }
}
