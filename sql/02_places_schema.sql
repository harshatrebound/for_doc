-- Drop tables and their triggers in reverse order of dependencies
DROP TABLE IF EXISTS team_stay_images CASCADE;
DROP TABLE IF EXISTS team_outing_images CASCADE;
DROP TABLE IF EXISTS team_outing_amenities CASCADE;
DROP TABLE IF EXISTS team_outing_places CASCADE;
DROP TABLE IF EXISTS team_stays CASCADE;
DROP TABLE IF EXISTS regions CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;

-- Drop function used by triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Regions Table
CREATE TABLE regions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    banner_image_url VARCHAR(255),
    meta_title VARCHAR(200),
    meta_description TEXT,
    main_heading VARCHAR(200),
    sub_text TEXT,
    showcase_heading VARCHAR(200),
    showcase_sub_text TEXT,
    cta_text VARCHAR(100),
    cta_heading VARCHAR(200),
    cta_sub_text TEXT,
    form_button_text VARCHAR(100),
    final_cta_heading VARCHAR(200),
    final_cta_sub_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Amenities Table (for reusable amenities)
CREATE TABLE amenities (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team Stays Table
CREATE TABLE team_stays (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    meta_title VARCHAR(200),
    meta_description TEXT,
    alt_text VARCHAR(200),
    tagline TEXT,
    description TEXT,
    stay_details TEXT,
    location TEXT,
    location_plain_text TEXT,
    special_activities TEXT[],
    facilities TEXT[],
    stay_image_url VARCHAR(255),
    check_in_time VARCHAR(20),
    check_out_time VARCHAR(20),
    total_rooms INTEGER,
    destination VARCHAR(100),
    region_id uuid REFERENCES regions(id) ON DELETE CASCADE,
    price DECIMAL(10,2),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team Stay Images Table
CREATE TABLE team_stay_images (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    stay_id uuid REFERENCES team_stays(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(200),
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team Outing Places Table
CREATE TABLE team_outing_places (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    region_id uuid REFERENCES regions(id) ON DELETE CASCADE,
    min_capacity INTEGER,
    max_capacity INTEGER,
    price_range_start DECIMAL(10,2),
    price_range_end DECIMAL(10,2),
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    main_image_url VARCHAR(255),
    meta_title VARCHAR(200),
    meta_description TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team Outing Amenities (Junction Table)
CREATE TABLE team_outing_amenities (
    place_id uuid REFERENCES team_outing_places(id) ON DELETE CASCADE,
    amenity_id uuid REFERENCES amenities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (place_id, amenity_id)
);

-- Team Outing Images Table
CREATE TABLE team_outing_images (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    place_id uuid REFERENCES team_outing_places(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(200),
    heading VARCHAR(200),
    sub_text TEXT,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_regions_slug ON regions(slug);
CREATE INDEX idx_team_stays_region ON team_stays(region_id);
CREATE INDEX idx_team_stays_slug ON team_stays(slug);
CREATE INDEX idx_team_outing_places_region ON team_outing_places(region_id);
CREATE INDEX idx_team_outing_places_slug ON team_outing_places(slug);
CREATE INDEX idx_team_outing_amenities_place ON team_outing_amenities(place_id);
CREATE INDEX idx_team_outing_amenities_amenity ON team_outing_amenities(amenity_id);
CREATE INDEX idx_team_outing_images_place ON team_outing_images(place_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_regions_updated_at
    BEFORE UPDATE ON regions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amenities_updated_at
    BEFORE UPDATE ON amenities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_stays_updated_at
    BEFORE UPDATE ON team_stays
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_outing_places_updated_at
    BEFORE UPDATE ON team_outing_places
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 