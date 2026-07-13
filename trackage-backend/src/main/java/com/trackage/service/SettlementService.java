package com.trackage.service;

import com.trackage.dto.SettlementSuggestionDTO;
import com.trackage.entity.Balance;
import com.trackage.repository.BalanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Computes the minimum set of payments that settle all balances in a group
 * (Settle Up's signature "simplify debts" feature): greedily match the
 * largest creditor with the largest debtor until everyone nets to zero.
 */
@Service
@RequiredArgsConstructor
public class SettlementService {

    private final BalanceRepository balanceRepository;
    private final GroupService groupService;

    @Transactional(readOnly = true)
    public List<SettlementSuggestionDTO> getSuggestions(Long groupId, Long requesterId) {
        groupService.assertMember(groupId, requesterId);

        List<Entry> creditors = new ArrayList<>();
        List<Entry> debtors = new ArrayList<>();
        for (Balance b : balanceRepository.findByGroup_Id(groupId)) {
            int cmp = b.getBalance().compareTo(BigDecimal.ZERO);
            if (cmp > 0) {
                creditors.add(new Entry(b.getUser().getId(), b.getUser().getName(), b.getBalance()));
            } else if (cmp < 0) {
                debtors.add(new Entry(b.getUser().getId(), b.getUser().getName(), b.getBalance().abs()));
            }
        }
        creditors.sort(Comparator.comparing((Entry e) -> e.amount).reversed());
        debtors.sort(Comparator.comparing((Entry e) -> e.amount).reversed());

        List<SettlementSuggestionDTO> suggestions = new ArrayList<>();
        int ci = 0, di = 0;
        while (ci < creditors.size() && di < debtors.size()) {
            Entry creditor = creditors.get(ci);
            Entry debtor = debtors.get(di);
            BigDecimal settled = creditor.amount.min(debtor.amount);

            suggestions.add(SettlementSuggestionDTO.builder()
                    .fromUserId(debtor.userId)
                    .fromUserName(debtor.userName)
                    .toUserId(creditor.userId)
                    .toUserName(creditor.userName)
                    .amount(settled)
                    .build());

            creditor.amount = creditor.amount.subtract(settled);
            debtor.amount = debtor.amount.subtract(settled);
            if (creditor.amount.compareTo(BigDecimal.ZERO) == 0) ci++;
            if (debtor.amount.compareTo(BigDecimal.ZERO) == 0) di++;
        }
        return suggestions;
    }

    private static final class Entry {
        final Long userId;
        final String userName;
        BigDecimal amount;

        Entry(Long userId, String userName, BigDecimal amount) {
            this.userId = userId;
            this.userName = userName;
            this.amount = amount;
        }
    }
}
