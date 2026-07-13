package com.trackage.controller;

import com.trackage.dto.BalanceResponseDTO;
import com.trackage.dto.SettlementSuggestionDTO;
import com.trackage.service.BalanceService;
import com.trackage.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trackage/groups")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;
    private final SettlementService settlementService;

    @GetMapping("/{id}/balances")
    public List<BalanceResponseDTO> getBalances(@PathVariable Long id, @AuthenticationPrincipal Long currentUserId) {
        return balanceService.getBalances(id, currentUserId);
    }

    @GetMapping("/{id}/settlements/suggestions")
    public List<SettlementSuggestionDTO> getSettlementSuggestions(@PathVariable Long id,
                                                                   @AuthenticationPrincipal Long currentUserId) {
        return settlementService.getSuggestions(id, currentUserId);
    }
}
