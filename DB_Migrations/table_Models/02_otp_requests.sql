-- OTP Requests table
-- Stores one-time passwords for email and phone verification

CREATE TABLE otp_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255),
    phone_number VARCHAR(20),
    otp_code VARCHAR(6) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure either email or phone is provided, but not both
    CONSTRAINT chk_email_or_phone CHECK (
        (email IS NOT NULL AND phone_number IS NULL) OR 
        (email IS NULL AND phone_number IS NOT NULL)
    )
);

-- Indexes for performance
CREATE INDEX idx_otp_email ON otp_requests(email);
CREATE INDEX idx_otp_phone ON otp_requests(phone_number);
CREATE INDEX idx_otp_expires_at ON otp_requests(expires_at);
CREATE INDEX idx_otp_is_verified ON otp_requests(is_verified);
