-- Locations table
-- Stores user location sharing information

CREATE TYPE visibility_level AS ENUM ('public', 'friends', 'private');

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    visibility visibility_level NOT NULL DEFAULT 'friends',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_locations_visibility ON locations(visibility);
CREATE INDEX idx_locations_is_active ON locations(is_active);
CREATE INDEX idx_locations_created_at ON locations(created_at);

-- Spatial index for efficient geographic queries
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
