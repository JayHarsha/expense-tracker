package com.trackage.controller;

import com.trackage.dto.AddPlaceholderMemberRequestDTO;
import com.trackage.dto.CategoryDTO;
import com.trackage.dto.CreateGroupRequestDTO;
import com.trackage.dto.GroupDetailDTO;
import com.trackage.dto.GroupSummaryDTO;
import com.trackage.dto.JoinGroupRequestDTO;
import com.trackage.dto.UserSummaryDTO;
import com.trackage.service.CategoryService;
import com.trackage.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trackage/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<GroupSummaryDTO> create(@Valid @RequestBody CreateGroupRequestDTO req,
                                                   @AuthenticationPrincipal Long currentUserId) {
        return ResponseEntity.ok(groupService.createGroup(req.getName(), currentUserId));
    }

    @GetMapping
    public List<GroupSummaryDTO> listMine(@AuthenticationPrincipal Long currentUserId) {
        return groupService.listGroupsForUser(currentUserId);
    }

    @GetMapping("/{id}")
    public GroupDetailDTO getDetail(@PathVariable Long id, @AuthenticationPrincipal Long currentUserId) {
        return groupService.getGroupDetail(id, currentUserId);
    }

    @PatchMapping("/{id}")
    public GroupSummaryDTO rename(@PathVariable Long id, @Valid @RequestBody CreateGroupRequestDTO req,
                                   @AuthenticationPrincipal Long currentUserId) {
        return groupService.renameGroup(id, req.getName(), currentUserId);
    }

    @PostMapping("/join")
    public ResponseEntity<GroupSummaryDTO> join(@Valid @RequestBody JoinGroupRequestDTO req,
                                                 @AuthenticationPrincipal Long currentUserId) {
        return ResponseEntity.ok(groupService.joinByInviteCode(req.getInviteCode(), currentUserId));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<UserSummaryDTO> addPlaceholderMember(@PathVariable Long id,
                                                                 @Valid @RequestBody AddPlaceholderMemberRequestDTO req,
                                                                 @AuthenticationPrincipal Long currentUserId) {
        return ResponseEntity.ok(groupService.addPlaceholderMember(id, req.getName(), currentUserId));
    }

    @DeleteMapping("/{id}/members/me")
    public ResponseEntity<Void> leave(@PathVariable Long id, @AuthenticationPrincipal Long currentUserId) {
        groupService.leaveGroup(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/categories")
    public List<CategoryDTO> getCategories(@PathVariable Long id, @AuthenticationPrincipal Long currentUserId) {
        groupService.assertMember(id, currentUserId);
        return categoryService.getCategories(id);
    }
}
