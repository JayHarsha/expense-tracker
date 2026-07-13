package com.trackage.repository;

import com.trackage.entity.AppGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AppGroupRepository extends JpaRepository<AppGroup, Long> {
    Optional<AppGroup> findByInviteCode(String inviteCode);

    @Query("select g from AppGroup g join GroupMember gm on gm.group = g "
            + "where gm.user.id = :userId order by g.createdAt desc")
    List<AppGroup> findAllForUser(@Param("userId") Long userId);
}
