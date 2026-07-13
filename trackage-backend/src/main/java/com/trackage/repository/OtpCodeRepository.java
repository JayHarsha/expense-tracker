package com.trackage.repository;

import com.trackage.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    List<OtpCode> findByUser_IdAndPurposeAndConsumedFalse(Long userId, OtpCode.OtpPurpose purpose);
    Optional<OtpCode> findTopByUser_IdAndPurposeAndConsumedFalseOrderByCreatedAtDesc(Long userId, OtpCode.OtpPurpose purpose);
}
