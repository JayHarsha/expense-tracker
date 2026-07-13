package com.trackage.repository;

import com.trackage.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    boolean existsByGroup_IdAndUser_Id(Long groupId, Long userId);
    List<GroupMember> findByGroup_Id(Long groupId);
    Optional<GroupMember> findByGroup_IdAndUser_Id(Long groupId, Long userId);
    void deleteByGroup_IdAndUser_Id(Long groupId, Long userId);
}
