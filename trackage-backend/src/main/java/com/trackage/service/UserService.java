package com.trackage.service;

import com.trackage.dto.UpdateProfileRequestDTO;
import com.trackage.dto.UserSummaryDTO;
import com.trackage.entity.User;
import com.trackage.exception.ResourceNotFoundException;
import com.trackage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserSummaryDTO getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toSummary(user);
    }

    @Transactional
    public UserSummaryDTO updateProfile(Long id, UpdateProfileRequestDTO req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName().trim());
        }
        if (req.getAvatar() != null) {
            String avatar = req.getAvatar();
            if (avatar.isBlank()) {
                user.setAvatar(null);
            } else {
                if (!avatar.startsWith("data:image/")) {
                    throw new IllegalArgumentException("Avatar must be an image");
                }
                user.setAvatar(avatar);
            }
        }
        return toSummary(user);
    }

    private UserSummaryDTO toSummary(User u) {
        return UserSummaryDTO.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .avatar(u.getAvatar())
                .isPlaceholder(u.isPlaceholder())
                .build();
    }
}
