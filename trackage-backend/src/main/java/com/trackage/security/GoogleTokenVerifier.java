package com.trackage.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Component;

/**
 * Verifies Google ID tokens produced by the "Sign in with Google" button: fetches
 * Google's JWKS (cached by Nimbus), checks the RS256 signature, expiry, issuer, and
 * that the token was minted for THIS app (audience = our OAuth client id) - so a
 * token issued to some other website can't be replayed here.
 */
@Component
public class GoogleTokenVerifier {

    private static final String GOOGLE_JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";
    private static final String GOOGLE_ISSUER = "https://accounts.google.com";

    private final String clientId;
    private volatile NimbusJwtDecoder decoder; // lazy so startup never blocks on Google

    public GoogleTokenVerifier(@Value("${app.google.client-id}") String clientId) {
        this.clientId = clientId;
    }

    public Jwt verify(String idToken) {
        if (clientId == null || clientId.isBlank()) {
            throw new IllegalStateException("Google Sign-In is not configured on this server");
        }
        try {
            return decoder().decode(idToken);
        } catch (JwtException e) {
            throw new IllegalArgumentException("Invalid Google token", e);
        }
    }

    private NimbusJwtDecoder decoder() {
        NimbusJwtDecoder local = decoder;
        if (local == null) {
            synchronized (this) {
                if (decoder == null) {
                    NimbusJwtDecoder built = NimbusJwtDecoder.withJwkSetUri(GOOGLE_JWKS_URI).build();
                    OAuth2TokenValidator<Jwt> audience = jwt -> jwt.getAudience().contains(clientId)
                            ? OAuth2TokenValidatorResult.success()
                            : OAuth2TokenValidatorResult.failure(
                                    new OAuth2Error("invalid_token", "Token audience does not match this app", null));
                    built.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                            JwtValidators.createDefaultWithIssuer(GOOGLE_ISSUER), audience));
                    decoder = built;
                }
                local = decoder;
            }
        }
        return local;
    }
}
