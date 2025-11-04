-- Challenge Completions table
-- Tracks user completion of challenges

CREATE TABLE challenge_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    proof_url VARCHAR(500),
    
    -- Ensure user can only complete each challenge once
    CONSTRAINT unique_challenge_completion UNIQUE (challenge_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_challenge_completions_challenge_id ON challenge_completions(challenge_id);
CREATE INDEX idx_challenge_completions_user_id ON challenge_completions(user_id);
CREATE INDEX idx_challenge_completions_completed_at ON challenge_completions(completed_at);

-- Composite index for leaderboards
CREATE INDEX idx_challenge_completions_user_completed ON challenge_completions(user_id, completed_at DESC);
