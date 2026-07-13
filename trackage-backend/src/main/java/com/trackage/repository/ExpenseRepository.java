package com.trackage.repository;

import com.trackage.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("select e from Expense e where e.group.id = :groupId"
            + " and (:from is null or e.date >= :from)"
            + " and (:to is null or e.date <= :to)"
            + " and (:categoryId is null or e.category.id = :categoryId)"
            + " order by e.date desc, e.id desc")
    List<Expense> search(@Param("groupId") Long groupId,
                         @Param("from") LocalDate from,
                         @Param("to") LocalDate to,
                         @Param("categoryId") Long categoryId);

    @Query("select coalesce(sum(e.amount), 0) from Expense e"
            + " where e.paidBy.id = :userId and e.group.id in :groupIds"
            + " and (:from is null or e.date >= :from) and (:to is null or e.date <= :to)")
    BigDecimal sumPaidByUser(@Param("userId") Long userId, @Param("groupIds") List<Long> groupIds,
                            @Param("from") LocalDate from, @Param("to") LocalDate to);
}
