package com.trackage.controller;

import com.trackage.dto.ExpenseRequestDTO;
import com.trackage.dto.ExpenseResponseDTO;
import com.trackage.dto.SettleUpRequestDTO;
import com.trackage.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trackage/expenses")
@RequiredArgsConstructor
public class ExpenseController {
    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponseDTO> create(@Valid @RequestBody ExpenseRequestDTO req,
                                                      @AuthenticationPrincipal Long currentUserId) {
        return ResponseEntity.ok(expenseService.createExpense(req, currentUserId));
    }

    @PostMapping("/settle")
    public ResponseEntity<ExpenseResponseDTO> settle(@Valid @RequestBody SettleUpRequestDTO req,
                                                      @AuthenticationPrincipal Long currentUserId) {
        return ResponseEntity.ok(expenseService.recordSettlement(req, currentUserId));
    }

    @GetMapping("/{id}")
    public ExpenseResponseDTO getById(@PathVariable Long id, @AuthenticationPrincipal Long currentUserId) {
        return expenseService.getById(id, currentUserId);
    }

    @PutMapping("/{id}")
    public ExpenseResponseDTO update(@PathVariable Long id, @Valid @RequestBody ExpenseRequestDTO req,
                                      @AuthenticationPrincipal Long currentUserId) {
        return expenseService.updateExpense(id, req, currentUserId);
    }

    @GetMapping
    public List<ExpenseResponseDTO> list(@RequestParam Long groupId,
                              @RequestParam(required = false) Integer month,
                              @RequestParam(required = false, name = "ym") String yearMonth,
                              @RequestParam(required = false) Long categoryId,
                              @AuthenticationPrincipal Long currentUserId) {
        return expenseService.search(groupId, month, yearMonth, categoryId, currentUserId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Long currentUserId) {
        expenseService.deleteExpense(id, currentUserId);
        return ResponseEntity.noContent().build();
    }
}
