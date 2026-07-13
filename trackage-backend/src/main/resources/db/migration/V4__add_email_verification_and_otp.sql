ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE otp_codes (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash  VARCHAR(255) NOT NULL,
    purpose    VARCHAR(30) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed   BOOLEAN NOT NULL DEFAULT false,
    attempts   INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_otp_codes_user_id_purpose ON otp_codes(user_id, purpose);
