-- Drop tables and their triggers in reverse order of dependencies
DROP TABLE IF EXISTS activity_pricing_tiers CASCADE;
DROP TABLE IF EXISTS activity_images CASCADE;
DROP TABLE IF EXISTS activity_tags CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop function used by triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE categories (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    meta_title VARCHAR(200),
    meta_description TEXT,
    display_order INTEGER,
    parent_category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE tags (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    meta_title VARCHAR(200),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activities Table
CREATE TABLE activities (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    tagline VARCHAR(200),
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    activity_type VARCHAR(50),
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    duration_minutes INTEGER,
    min_participants INTEGER,
    max_participants INTEGER,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('Easy', 'Moderate', 'Challenging')),
    is_outbound BOOLEAN DEFAULT false,
    is_mainstream BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    price_per_person DECIMAL(10,2),
    target_areas TEXT[],
    meta_title VARCHAR(200),
    meta_description TEXT,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity Tags (Junction Table)
CREATE TABLE activity_tags (
    activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
    tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (activity_id, tag_id)
);

-- Activity Images Table
CREATE TABLE activity_images (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(200),
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity Pricing Tiers
CREATE TABLE activity_pricing_tiers (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
    tier_name VARCHAR(100) NOT NULL,
    min_participants INTEGER NOT NULL,
    max_participants INTEGER NOT NULL,
    price_per_person DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_participant_range CHECK (min_participants <= max_participants)
);

-- Indexes
CREATE INDEX idx_activities_category ON activities(category_id);
CREATE INDEX idx_activities_slug ON activities(slug);
CREATE INDEX idx_activities_activity_type ON activities(activity_type);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_category_id);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_activity_tags_tag ON activity_tags(tag_id);
CREATE INDEX idx_activity_tags_activity ON activity_tags(activity_id);
CREATE INDEX idx_activity_images_activity ON activity_images(activity_id);
CREATE INDEX idx_activity_pricing_activity ON activity_pricing_tiers(activity_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_pricing_updated_at
    BEFORE UPDATE ON activity_pricing_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 