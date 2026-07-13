package com.trackage.controller;

import com.trackage.dto.MemberSpendingSummaryDTO;
import com.trackage.dto.PersonalSpendingSummaryDTO;
import com.trackage.service.SpendingSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SpendingSummaryController {

    private final SpendingSummaryService spendingSummaryService;

    @GetMapping("/trackage/groups/{id}/spending-summary")
    public List<MemberSpendingSummaryDTO> groupSummary(@PathVariable Long id,
                                                         @RequestParam(required = false, name = "ym") String yearMonth,
                                                         @AuthenticationPrincipal Long currentUserId) {
        return spendingSummaryService.getGroupSpendingSummary(id, yearMonth, currentUserId);
    }

    @GetMapping("/trackage/users/me/spending-summary")
    public PersonalSpendingSummaryDTO personalSummary(@RequestParam(required = false, name = "ym") String yearMonth,
                                                       @AuthenticationPrincipal Long currentUserId) {
        return spendingSummaryService.getPersonalSpendingSummary(yearMonth, currentUserId);
    }
}
