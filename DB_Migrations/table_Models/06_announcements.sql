-- Announcements table
-- Stores campus-wide announcements

CREATE TYPE announcement_category AS ENUM ('academic', 'event', 'general', 'urgent', 'sports', 'club');

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category announcement_category NOT NULL DEFAULT 'general',
    posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_announcements_posted_by ON announcements(posted_by);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);

-- Composite index for filtering by category and date
CREATE INDEX idx_announcements_category_created ON announcements(category, created_at DESC);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
