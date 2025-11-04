-- Mess Reviews table
-- Stores meal ratings and reviews for mess food

CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snacks');

CREATE TABLE mess_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type meal_type NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    meal_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure user can only review each meal once per day
    CONSTRAINT unique_user_meal_date UNIQUE (user_id, meal_type, meal_date)
);

-- Indexes for performance
CREATE INDEX idx_mess_reviews_user_id ON mess_reviews(user_id);
CREATE INDEX idx_mess_reviews_meal_type ON mess_reviews(meal_type);
CREATE INDEX idx_mess_reviews_meal_date ON mess_reviews(meal_date DESC);
CREATE INDEX idx_mess_reviews_rating ON mess_reviews(rating);
CREATE INDEX idx_mess_reviews_created_at ON mess_reviews(created_at);

-- Composite index for aggregating reviews by meal and date
CREATE INDEX idx_mess_reviews_meal_date_type ON mess_reviews(meal_date DESC, meal_type);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_mess_reviews_updated_at BEFORE UPDATE ON mess_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
