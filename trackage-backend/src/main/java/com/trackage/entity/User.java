package com.trackage.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 150, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    /** True for offline/placeholder members added by name (no login), e.g. a friend who hasn't signed up. */
    @Column(name = "is_placeholder", nullable = false)
    @Builder.Default
    private boolean isPlaceholder = false;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    /** Optional profile picture as a small data URL (resized client-side before upload). */
    @Column(columnDefinition = "TEXT")
    private String avatar;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
