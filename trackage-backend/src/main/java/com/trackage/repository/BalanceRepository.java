package com.trackage.repository;

import com.trackage.entity.Balance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface BalanceRepository extends JpaRepository<Balance, Long> {
    List<Balance> findByGroup_Id(Long groupId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Balance> findByGroup_IdAndUser_Id(Long groupId, Long userId);
}
