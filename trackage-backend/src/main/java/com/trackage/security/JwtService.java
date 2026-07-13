package com.trackage.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;

/**
 * Issues and validates short-lived stateless access tokens. Refresh tokens are opaque
 * and tracked in the database (see AuthService) so they can be revoked/rotated.
 */
@Component
public class JwtService {

    private final SecretKey key;
    private final long accessTokenTtlMinutes;
    private final long refreshTokenTtlDays;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                       @Value("${app.jwt.access-token-ttl-minutes}") long accessTokenTtlMinutes,
                       @Value("${app.jwt.refresh-token-ttl-days}") long refreshTokenTtlDays) {
        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        this.accessTokenTtlMinutes = accessTokenTtlMinutes;
        this.refreshTokenTtlDays = refreshTokenTtlDays;
    }

    public String generateAccessToken(Long userId, String email) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(email)
                .claim("uid", String.valueOf(userId))
                .claim("type", "access")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTokenTtlMinutes * 60)))
                .signWith(key)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public long getRefreshTokenTtlDays() {
        return refreshTokenTtlDays;
    }
}
