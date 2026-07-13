package com.trackage.repository;

import com.trackage.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {
    List<ExpenseSplit> findByExpense_Id(Long expenseId);
    List<ExpenseSplit> findByExpense_Id_In(List<Long> expenseIds);
}
