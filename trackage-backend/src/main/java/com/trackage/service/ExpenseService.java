package com.trackage.service;

import com.trackage.dto.ExpenseRequestDTO;
import com.trackage.dto.ExpenseResponseDTO;
import com.trackage.dto.SettleUpRequestDTO;
import com.trackage.entity.*;
import com.trackage.exception.ResourceNotFoundException;
import com.trackage.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final AppGroupRepository appGroupRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final BalanceService balanceService;
    private final GroupService groupService;

    private static final String REPAYMENT = "Repayment";

    @Transactional
    public ExpenseResponseDTO createExpense(ExpenseRequestDTO req, Long requesterId) {
        groupService.assertMember(req.getGroupId(), requesterId);
        ResolvedExpense resolved = resolveAndValidate(req);

        Expense expense = Expense.builder()
                .group(resolved.group())
                .paidBy(resolved.payer())
                .amount(resolved.total())
                .description(req.getDescription())
                .category(resolved.category())
                .date(req.getDate() != null ? req.getDate() : LocalDate.now())
                .createdAt(Instant.now())
                .build();
        expense = expenseRepository.save(expense);

        List<ExpenseSplit> splits = buildSplits(expense, resolved);
        expenseSplitRepository.saveAll(splits);

        applyBalanceDeltas(resolved.group().getId(), resolved.payer().getId(), resolved.payerShare(), resolved.total(), splits, 1);

        return toResponse(expense, splits);
    }

    @Transactional
    public ExpenseResponseDTO updateExpense(Long expenseId, ExpenseRequestDTO req, Long requesterId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        groupService.assertMember(expense.getGroup().getId(), requesterId);
        if (!expense.getGroup().getId().equals(req.getGroupId())) {
            throw new IllegalArgumentException("Cannot move an expense to a different group");
        }

        List<ExpenseSplit> oldSplits = expenseSplitRepository.findByExpense_Id(expenseId);
        BigDecimal oldPayerShare = shareOf(oldSplits, expense.getPaidBy().getId());
        applyBalanceDeltas(expense.getGroup().getId(), expense.getPaidBy().getId(), oldPayerShare, expense.getAmount(), oldSplits, -1);
        expenseSplitRepository.deleteAll(oldSplits);

        ResolvedExpense resolved = resolveAndValidate(req);
        expense.setPaidBy(resolved.payer());
        expense.setAmount(resolved.total());
        expense.setDescription(req.getDescription());
        expense.setCategory(resolved.category());
        expense.setDate(req.getDate() != null ? req.getDate() : LocalDate.now());
        expense = expenseRepository.save(expense);

        List<ExpenseSplit> newSplits = buildSplits(expense, resolved);
        expenseSplitRepository.saveAll(newSplits);

        applyBalanceDeltas(resolved.group().getId(), resolved.payer().getId(), resolved.payerShare(), resolved.total(), newSplits, 1);

        return toResponse(expense, newSplits);
    }

    @Transactional
    public void deleteExpense(Long expenseId, Long requesterId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        groupService.assertMember(expense.getGroup().getId(), requesterId);

        List<ExpenseSplit> splits = expenseSplitRepository.findByExpense_Id(expenseId);
        BigDecimal payerShare = shareOf(splits, expense.getPaidBy().getId());
        applyBalanceDeltas(expense.getGroup().getId(), expense.getPaidBy().getId(), payerShare, expense.getAmount(), splits, -1);

        expenseSplitRepository.deleteAll(splits);
        expenseRepository.delete(expense);
    }

    @Transactional
    public ExpenseResponseDTO recordSettlement(SettleUpRequestDTO req, Long requesterId) {
        groupService.assertMember(req.getGroupId(), requesterId);
        // Settlement is an expense paid by payer, fully split to receiver
        Category repayCat = categoryRepository.findByGroup_IdAndNameIgnoreCase(req.getGroupId(), REPAYMENT)
                .orElseGet(() -> {
                    AppGroup g = appGroupRepository.findById(req.getGroupId())
                            .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
                    return categoryRepository.save(Category.builder().group(g).name(REPAYMENT).color("#00B894").icon("🤝").build());
                });
        ExpenseRequestDTO expenseReq = ExpenseRequestDTO.builder()
                .groupId(req.getGroupId())
                .paidByUserId(req.getPayerId())
                .amount(req.getAmount())
                .description("Settlement: " + req.getPayerId() + " -> " + req.getReceiverId())
                .categoryId(repayCat.getId())
                .date(req.getDate() != null ? req.getDate() : LocalDate.now())
                .splits(List.of(ExpenseRequestDTO.Split.builder().userId(req.getReceiverId()).amount(req.getAmount()).build()))
                .build();
        return createExpense(expenseReq, requesterId);
    }

    @Transactional(readOnly = true)
    public ExpenseResponseDTO getById(Long expenseId, Long requesterId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        groupService.assertMember(expense.getGroup().getId(), requesterId);
        List<ExpenseSplit> splits = expenseSplitRepository.findByExpense_Id(expenseId);
        return toResponse(expense, splits);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponseDTO> search(Long groupId, Integer month, String yearMonth, Long categoryId,
                                            Long requesterId) {
        groupService.assertMember(groupId, requesterId);
        LocalDate from = null, to = null;
        if (yearMonth != null && yearMonth.matches("\\d{4}-\\d{2}")) {
            int y = Integer.parseInt(yearMonth.substring(0, 4));
            int m = Integer.parseInt(yearMonth.substring(5));
            from = LocalDate.of(y, m, 1);
            to = from.withDayOfMonth(from.lengthOfMonth());
        } else if (month != null) {
            java.time.Year currentYear = java.time.Year.now();
            from = LocalDate.of(currentYear.getValue(), month, 1);
            to = from.withDayOfMonth(from.lengthOfMonth());
        }
        List<Expense> expenses = expenseRepository.search(groupId, from, to, categoryId);
        List<Long> expenseIds = expenses.stream().map(Expense::getId).toList();
        var splitsByExpense = expenseSplitRepository.findByExpense_Id_In(expenseIds).stream()
                .collect(java.util.stream.Collectors.groupingBy(s -> s.getExpense().getId()));
        return expenses.stream()
                .map(e -> toResponse(e, splitsByExpense.getOrDefault(e.getId(), List.of())))
                .toList();
    }

    // ---- shared helpers (reused by create/update/delete so the validation and
    // balance math each live in exactly one place) ----

    private ResolvedExpense resolveAndValidate(ExpenseRequestDTO req) {
        AppGroup group = appGroupRepository.findById(req.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        User payer = userRepository.findById(req.getPaidByUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Payer not found"));
        if (!groupMemberRepository.existsByGroup_IdAndUser_Id(group.getId(), payer.getId())) {
            throw new IllegalArgumentException("Payer is not a member of the group");
        }
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (!category.getGroup().getId().equals(group.getId())) {
            throw new IllegalArgumentException("Category does not belong to group");
        }

        BigDecimal total = req.getAmount().setScale(2);
        BigDecimal sumSplits = req.getSplits().stream()
                .map(s -> s.getAmount().setScale(2))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (total.compareTo(sumSplits) != 0) {
            throw new IllegalArgumentException("Split amounts must sum to total amount");
        }

        List<User> splitUsers = new ArrayList<>();
        BigDecimal payerShare = BigDecimal.ZERO;
        for (ExpenseRequestDTO.Split s : req.getSplits()) {
            if (!groupMemberRepository.existsByGroup_IdAndUser_Id(group.getId(), s.getUserId())) {
                throw new IllegalArgumentException("User " + s.getUserId() + " is not a member of the group");
            }
            User u = userRepository.findById(s.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + s.getUserId()));
            splitUsers.add(u);
            if (u.getId().equals(payer.getId())) {
                payerShare = payerShare.add(s.getAmount().setScale(2));
            }
        }

        return new ResolvedExpense(group, payer, category, total, payerShare, req.getSplits(), splitUsers);
    }

    private List<ExpenseSplit> buildSplits(Expense expense, ResolvedExpense resolved) {
        List<ExpenseSplit> splits = new ArrayList<>();
        for (int i = 0; i < resolved.splitRequests().size(); i++) {
            ExpenseRequestDTO.Split s = resolved.splitRequests().get(i);
            splits.add(ExpenseSplit.builder()
                    .expense(expense)
                    .user(resolved.splitUsers().get(i))
                    .amount(s.getAmount().setScale(2))
                    .build());
        }
        return splits;
    }

    /** Applies (sign=1) or reverses (sign=-1) an expense's effect on group balances. */
    private void applyBalanceDeltas(Long groupId, Long payerId, BigDecimal payerShare, BigDecimal total,
                                     List<ExpenseSplit> splits, int sign) {
        BigDecimal signMultiplier = BigDecimal.valueOf(sign);
        BigDecimal payerDelta = total.subtract(payerShare).multiply(signMultiplier);
        if (payerDelta.compareTo(BigDecimal.ZERO) != 0) {
            Balance pb = balanceService.getOrCreateLocked(groupId, payerId);
            pb.setBalance(pb.getBalance().add(payerDelta));
            pb.setUpdatedAt(Instant.now());
        }
        for (ExpenseSplit sp : splits) {
            if (!sp.getUser().getId().equals(payerId)) {
                Balance b = balanceService.getOrCreateLocked(groupId, sp.getUser().getId());
                b.setBalance(b.getBalance().subtract(sp.getAmount().multiply(signMultiplier)));
                b.setUpdatedAt(Instant.now());
            }
        }
    }

    private BigDecimal shareOf(List<ExpenseSplit> splits, Long userId) {
        return splits.stream()
                .filter(s -> s.getUser().getId().equals(userId))
                .map(ExpenseSplit::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private ExpenseResponseDTO toResponse(Expense e, List<ExpenseSplit> splits) {
        return ExpenseResponseDTO.builder()
                .id(e.getId())
                .groupId(e.getGroup().getId())
                .paidByUserId(e.getPaidBy().getId())
                .paidByName(e.getPaidBy().getName())
                .amount(e.getAmount())
                .description(e.getDescription())
                .categoryId(e.getCategory() != null ? e.getCategory().getId() : null)
                .categoryName(e.getCategory() != null ? e.getCategory().getName() : null)
                .categoryColor(e.getCategory() != null ? e.getCategory().getColor() : null)
                .categoryIcon(e.getCategory() != null ? e.getCategory().getIcon() : null)
                .date(e.getDate())
                .createdAt(e.getCreatedAt())
                .splits(splits.stream()
                        .map(s -> ExpenseResponseDTO.SplitView.builder()
                                .userId(s.getUser().getId())
                                .userName(s.getUser().getName())
                                .amount(s.getAmount())
                                .build())
                        .toList())
                .build();
    }

    private record ResolvedExpense(AppGroup group, User payer, Category category,
                                    BigDecimal total, BigDecimal payerShare,
                                    List<ExpenseRequestDTO.Split> splitRequests, List<User> splitUsers) {
    }
}
