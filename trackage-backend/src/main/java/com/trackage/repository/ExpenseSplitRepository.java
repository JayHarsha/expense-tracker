package com.trackage.repository;

import com.trackage.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {
    List<ExpenseSplit> findByExpense_Id(Long expenseId);
    List<ExpenseSplit> findByExpense_Id_In(List<Long> expenseIds);

    @Query("select coalesce(sum(s.amount), 0) from ExpenseSplit s"
            + " where s.user.id = :userId and s.expense.group.id in :groupIds"
            + " and (:from is null or s.expense.date >= :from) and (:to is null or s.expense.date <= :to)"
            + " and lower(s.expense.category.name) <> 'repayment'")
    BigDecimal sumShareForUser(@Param("userId") Long userId, @Param("groupIds") List<Long> groupIds,
                               @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("select coalesce(sum(s.amount), 0) from ExpenseSplit s"
            + " where s.user.id = :userId and s.expense.group.id in :groupIds"
            + " and (:from is null or s.expense.date >= :from) and (:to is null or s.expense.date <= :to)"
            + " and lower(s.expense.category.name) = 'repayment'")
    BigDecimal sumSettlementsReceivedByUser(@Param("userId") Long userId, @Param("groupIds") List<Long> groupIds,
                                            @Param("from") LocalDate from, @Param("to") LocalDate to);
}
