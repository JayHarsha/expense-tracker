package com.trackage.service;

import com.trackage.dto.GroupDetailDTO;
import com.trackage.dto.GroupSummaryDTO;
import com.trackage.dto.UserSummaryDTO;
import com.trackage.entity.AppGroup;
import com.trackage.entity.Balance;
import com.trackage.entity.GroupMember;
import com.trackage.entity.User;
import com.trackage.exception.ForbiddenOperationException;
import com.trackage.exception.ResourceNotFoundException;
import com.trackage.repository.AppGroupRepository;
import com.trackage.repository.BalanceRepository;
import com.trackage.repository.GroupMemberRepository;
import com.trackage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final AppGroupRepository appGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final BalanceRepository balanceRepository;
    private final CategoryService categoryService;
    private final PasswordEncoder passwordEncoder;

    private static final String INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
    private static final int INVITE_CODE_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private static final List<String[]> DEFAULT_CATEGORIES = List.of(
            new String[]{"Food & Drink", "#FF6B6B", "🍲"},
            new String[]{"Drinks", "#F4A259", "🍺"},
            new String[]{"Accommodation", "#5C7AEA", "🛏️"},
            new String[]{"Transport", "#4D96FF", "🚆"},
            new String[]{"Entertainment", "#C780FA", "🎟️"},
            new String[]{"Shopping", "#6BCB77", "🛒"},
            new String[]{"Housing", "#FFD93D", "🏠"},
            new String[]{"Utilities", "#00C2CB", "💡"},
            new String[]{"Other", "#A0A0A0", "📄"}
    );

    @Transactional
    public GroupSummaryDTO createGroup(String name, Long creatorUserId) {
        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AppGroup group = AppGroup.builder()
                .name(name)
                .createdBy(creator)
                .inviteCode(generateUniqueInviteCode())
                .build();
        group = appGroupRepository.save(group);

        groupMemberRepository.save(GroupMember.builder().group(group).user(creator).build());
        for (String[] cat : DEFAULT_CATEGORIES) {
            categoryService.createCategory(group.getId(), cat[0], cat[1], cat[2]);
        }

        return toSummary(group);
    }

    public List<GroupSummaryDTO> listGroupsForUser(Long userId) {
        return appGroupRepository.findAllForUser(userId).stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public GroupDetailDTO getGroupDetail(Long groupId, Long requesterId) {
        assertMember(groupId, requesterId);
        AppGroup group = appGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        List<UserSummaryDTO> members = groupMemberRepository.findByGroup_Id(groupId).stream()
                .map(gm -> UserSummaryDTO.builder()
                        .id(gm.getUser().getId())
                        .name(gm.getUser().getName())
                        .email(gm.getUser().getEmail())
                        .avatar(gm.getUser().getAvatar())
                        .isPlaceholder(gm.getUser().isPlaceholder())
                        .build())
                .toList();
        return GroupDetailDTO.builder()
                .id(group.getId())
                .name(group.getName())
                .inviteCode(group.getInviteCode())
                .createdByUserId(group.getCreatedBy() != null ? group.getCreatedBy().getId() : null)
                .members(members)
                .build();
    }

    @Transactional
    public GroupSummaryDTO joinByInviteCode(String inviteCode, Long userId) {
        AppGroup group = appGroupRepository.findByInviteCode(inviteCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid invite code"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!groupMemberRepository.existsByGroup_IdAndUser_Id(group.getId(), userId)) {
            groupMemberRepository.save(GroupMember.builder().group(group).user(user).build());
        }
        return toSummary(group);
    }

    /**
     * Adds an "offline" member to a group by name only - e.g. a friend who hasn't
     * signed up yet. They get a real User row (so all the existing expense/balance
     * plumbing works unchanged) with a random, never-revealed password and a
     * synthetic email, flagged isPlaceholder so they can't log in and the UI can
     * badge them differently.
     */
    @Transactional
    public UserSummaryDTO addPlaceholderMember(Long groupId, String name, Long requesterId) {
        assertMember(groupId, requesterId);
        AppGroup group = appGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        byte[] randomBytes = new byte[24];
        RANDOM.nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        User placeholder = User.builder()
                .name(name)
                .email("placeholder-" + token + "@trackage.invalid")
                .passwordHash(passwordEncoder.encode(token))
                .isPlaceholder(true)
                .build();
        placeholder = userRepository.save(placeholder);

        groupMemberRepository.save(GroupMember.builder().group(group).user(placeholder).build());

        return UserSummaryDTO.builder()
                .id(placeholder.getId())
                .name(placeholder.getName())
                .email(placeholder.getEmail())
                .isPlaceholder(true)
                .build();
    }

    @Transactional
    public GroupSummaryDTO renameGroup(Long groupId, String name, Long requesterId) {
        assertMember(groupId, requesterId);
        AppGroup group = appGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        group.setName(name.trim());
        return toSummary(group);
    }

    @Transactional
    public void leaveGroup(Long groupId, Long userId) {
        assertMember(groupId, userId);
        BigDecimal balance = balanceRepository.findByGroup_IdAndUser_Id(groupId, userId)
                .map(Balance::getBalance)
                .orElse(BigDecimal.ZERO);
        if (balance.compareTo(BigDecimal.ZERO) != 0) {
            throw new IllegalArgumentException("Settle your balance before leaving the group");
        }
        groupMemberRepository.deleteByGroup_IdAndUser_Id(groupId, userId);
    }

    public void assertMember(Long groupId, Long userId) {
        if (!groupMemberRepository.existsByGroup_IdAndUser_Id(groupId, userId)) {
            throw new ForbiddenOperationException("You are not a member of this group");
        }
    }

    private GroupSummaryDTO toSummary(AppGroup group) {
        return GroupSummaryDTO.builder()
                .id(group.getId())
                .name(group.getName())
                .inviteCode(group.getInviteCode())
                .build();
    }

    private String generateUniqueInviteCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(INVITE_CODE_LENGTH);
            for (int i = 0; i < INVITE_CODE_LENGTH; i++) {
                sb.append(INVITE_CODE_ALPHABET.charAt(RANDOM.nextInt(INVITE_CODE_ALPHABET.length())));
            }
            code = sb.toString();
        } while (appGroupRepository.findByInviteCode(code).isPresent());
        return code;
    }
}
