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

    // Callers always pass concrete from/to bounds (an "everything" range when no month is
    // selected): Postgres can't infer parameter types in a bare "(:param is null or ...)".
    @Query("select coalesce(sum(s.amount), 0) from ExpenseSplit s"
            + " where s.user.id = :userId and s.expense.group.id in :groupIds"
            + " and s.expense.date >= :from and s.expense.date <= :to"
            + " and lower(s.expense.category.name) <> 'repayment'")
    BigDecimal sumShareForUser(@Param("userId") Long userId, @Param("groupIds") List<Long> groupIds,
                               @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("select coalesce(sum(s.amount), 0) from ExpenseSplit s"
            + " where s.user.id = :userId and s.expense.group.id in :groupIds"
            + " and s.expense.date >= :from and s.expense.date <= :to"
            + " and lower(s.expense.category.name) = 'repayment'")
    BigDecimal sumSettlementsReceivedByUser(@Param("userId") Long userId, @Param("groupIds") List<Long> groupIds,
                                            @Param("from") LocalDate from, @Param("to") LocalDate to);
}
