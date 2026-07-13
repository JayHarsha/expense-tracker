package com.trackage.service;

import com.trackage.dto.BalanceResponseDTO;
import com.trackage.entity.AppGroup;
import com.trackage.entity.Balance;
import com.trackage.entity.User;
import com.trackage.exception.ResourceNotFoundException;
import com.trackage.repository.AppGroupRepository;
import com.trackage.repository.BalanceRepository;
import com.trackage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BalanceService {
    private final BalanceRepository balanceRepository;
    private final AppGroupRepository appGroupRepository;
    private final UserRepository userRepository;
    private final GroupService groupService;

    @Transactional(readOnly = true)
    public List<BalanceResponseDTO> getBalances(Long groupId, Long requesterId) {
        groupService.assertMember(groupId, requesterId);
        return balanceRepository.findByGroup_Id(groupId).stream()
                .map(b -> BalanceResponseDTO.builder()
                        .userId(b.getUser().getId())
                        .userName(b.getUser().getName())
                        .balance(b.getBalance())
                        .build())
                .toList();
    }

    @Transactional
    public Balance getOrCreateLocked(Long groupId, Long userId) {
        return balanceRepository.findByGroup_IdAndUser_Id(groupId, userId)
                .orElseGet(() -> {
                    AppGroup group = appGroupRepository.findById(groupId)
                            .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    Balance b = Balance.builder()
                            .group(group)
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .updatedAt(Instant.now())
                            .build();
                    return balanceRepository.saveAndFlush(b);
                });
    }
}
