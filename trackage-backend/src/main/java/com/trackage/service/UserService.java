package com.trackage.service;

import com.trackage.dto.UserSummaryDTO;
import com.trackage.entity.User;
import com.trackage.exception.ResourceNotFoundException;
import com.trackage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserSummaryDTO getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toSummary(user);
    }

    private UserSummaryDTO toSummary(User u) {
        return UserSummaryDTO.builder().id(u.getId()).name(u.getName()).email(u.getEmail()).build();
    }
}
