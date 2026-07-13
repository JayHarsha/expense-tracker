package com.trackage.controller;

import com.trackage.dto.UserSummaryDTO;
import com.trackage.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/trackage/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserSummaryDTO me(@AuthenticationPrincipal Long currentUserId) {
        return userService.getById(currentUserId);
    }
}
