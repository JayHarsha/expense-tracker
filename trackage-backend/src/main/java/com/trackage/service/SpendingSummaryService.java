package com.trackage.service;

import com.trackage.dto.MemberSpendingSummaryDTO;
import com.trackage.dto.PersonalSpendingSummaryDTO;
import com.trackage.entity.AppGroup;
import com.trackage.entity.Balance;
import com.trackage.repository.AppGroupRepository;
import com.trackage.repository.BalanceRepository;
import com.trackage.repository.ExpenseRepository;
import com.trackage.repository.ExpenseSplitRepository;
import com.trackage.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SpendingSummaryService {
    private final GroupService groupService;
    private final GroupMemberRepository groupMemberRepository;
    private final AppGroupRepository appGroupRepository;
    private final BalanceRepository balanceRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;

    @Transactional(readOnly = true)
    public List<MemberSpendingSummaryDTO> getGroupSpendingSummary(Long groupId, String yearMonth, Long requesterId) {
        groupService.assertMember(groupId, requesterId);
        LocalDate[] range = resolveRange(yearMonth);
        List<Long> groupIds = List.of(groupId);

        return groupMemberRepository.findByGroup_Id(groupId).stream()
                .map(gm -> summaryFor(gm.getUser().getId(), gm.getUser().getName(), groupIds, range[0], range[1]))
                .toList();
    }

    @Transactional(readOnly = true)
    public PersonalSpendingSummaryDTO getPersonalSpendingSummary(String yearMonth, Long userId) {
        LocalDate[] range = resolveRange(yearMonth);
        List<Long> groupIds = appGroupRepository.findAllForUser(userId).stream().map(AppGroup::getId).toList();

        BigDecimal share = BigDecimal.ZERO;
        BigDecimal actualSpent = BigDecimal.ZERO;
        if (!groupIds.isEmpty()) {
            share = expenseSplitRepository.sumShareForUser(userId, groupIds, range[0], range[1]);
            BigDecimal paidOut = expenseRepository.sumPaidByUser(userId, groupIds, range[0], range[1]);
            BigDecimal settlementsReceived = expenseSplitRepository.sumSettlementsReceivedByUser(userId, groupIds, range[0], range[1]);
            actualSpent = paidOut.subtract(settlementsReceived);
        }

        BigDecimal netBalance = balanceRepository.findByUser_Id(userId).stream()
                .map(Balance::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PersonalSpendingSummaryDTO.builder()
                .share(share)
                .actualSpent(actualSpent)
                .netBalance(netBalance)
                .build();
    }

    private MemberSpendingSummaryDTO summaryFor(Long userId, String userName, List<Long> groupIds,
                                                 LocalDate from, LocalDate to) {
        BigDecimal share = expenseSplitRepository.sumShareForUser(userId, groupIds, from, to);
        BigDecimal paidOut = expenseRepository.sumPaidByUser(userId, groupIds, from, to);
        BigDecimal settlementsReceived = expenseSplitRepository.sumSettlementsReceivedByUser(userId, groupIds, from, to);
        return MemberSpendingSummaryDTO.builder()
                .userId(userId)
                .userName(userName)
                .share(share)
                .actualSpent(paidOut.subtract(settlementsReceived))
                .build();
    }

    private LocalDate[] resolveRange(String yearMonth) {
        if (yearMonth == null || !yearMonth.matches("\\d{4}-\\d{2}")) {
            // "All time" - concrete bounds because the repository queries always bind both.
            return new LocalDate[]{LocalDate.of(1970, 1, 1), LocalDate.of(9999, 12, 31)};
        }
        int y = Integer.parseInt(yearMonth.substring(0, 4));
        int m = Integer.parseInt(yearMonth.substring(5));
        LocalDate from = LocalDate.of(y, m, 1);
        return new LocalDate[]{from, from.withDayOfMonth(from.lengthOfMonth())};
    }
}
