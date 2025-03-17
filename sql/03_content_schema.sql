-- Drop tables and their triggers in reverse order of dependencies
DROP TABLE IF EXISTS blog_post_tags CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS job_listings CASCADE;
DROP TABLE IF EXISTS training_modules CASCADE;
DROP TABLE IF EXISTS customized_trainings CASCADE;
DROP TABLE IF EXISTS landing_page_sections CASCADE;
DROP TABLE IF EXISTS landing_pages CASCADE;
DROP TABLE IF EXISTS corporate_teambuilding_sections CASCADE;
DROP TABLE IF EXISTS corporate_teambuildings CASCADE;

-- Drop function used by triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Corporate Teambuildings Table
CREATE TABLE corporate_teambuildings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    target_keyword VARCHAR(200),
    main_heading VARCHAR(500),
    meta_description TEXT,
    tagline_above_heading TEXT,
    heading_2 VARCHAR(500),
    argument_heading_2 TEXT,
    satire_above_heading_3 TEXT,
    heading_3 VARCHAR(500),
    argument_1_heading_3 TEXT,
    argument_2_heading_3 TEXT,
    heading_4 VARCHAR(500),
    form_cta_heading VARCHAR(500),
    form_cta_paragraph TEXT,
    button_text VARCHAR(100),
    heading_special_section VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Corporate Teambuilding Sections Table (for reasons/cards)
CREATE TABLE corporate_teambuilding_sections (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    teambuilding_id uuid REFERENCES corporate_teambuildings(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL, -- 'reason' or 'card'
    heading VARCHAR(500),
    paragraph TEXT,
    image_url VARCHAR(255),
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Landing Pages Table
CREATE TABLE landing_pages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    meta_title VARCHAR(500),
    meta_description TEXT,
    main_heading VARCHAR(500),
    sub_heading TEXT,
    banner_image_url VARCHAR(255),
    cta_text VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Landing Page Sections Table
CREATE TABLE landing_page_sections (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    landing_page_id uuid REFERENCES landing_pages(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL, -- 'feature', 'testimonial', 'cta', etc.
    heading VARCHAR(500),
    content TEXT,
    image_url VARCHAR(255),
    button_text VARCHAR(100),
    button_url VARCHAR(255),
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customized Trainings Table
CREATE TABLE customized_trainings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    meta_title VARCHAR(500),
    meta_description TEXT,
    description TEXT,
    objectives TEXT[],
    target_audience TEXT,
    duration VARCHAR(100),
    delivery_method VARCHAR(100),
    price_range VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Training Modules Table
CREATE TABLE training_modules (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    training_id uuid REFERENCES customized_trainings(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration VARCHAR(100),
    learning_outcomes TEXT[],
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job Listings Table
CREATE TABLE job_listings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    department VARCHAR(100),
    location VARCHAR(200),
    employment_type VARCHAR(50),
    experience_level VARCHAR(50),
    description TEXT,
    responsibilities TEXT[],
    requirements TEXT[],
    benefits TEXT[],
    salary_range VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job Applications Table
CREATE TABLE job_applications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id uuid REFERENCES job_listings(id) ON DELETE SET NULL,
    applicant_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    resume_url VARCHAR(255),
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts Table
CREATE TABLE blog_posts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    meta_title VARCHAR(500),
    meta_description TEXT,
    content TEXT,
    excerpt TEXT,
    featured_image_url VARCHAR(255),
    author_name VARCHAR(100),
    reading_time INTEGER, -- in minutes
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog Post Tags Table
CREATE TABLE blog_post_tags (
    post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, tag_id)
);

-- Indexes
CREATE INDEX idx_corporate_teambuildings_slug ON corporate_teambuildings(slug);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_customized_trainings_slug ON customized_trainings(slug);
CREATE INDEX idx_job_listings_slug ON job_listings(slug);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_job_listings_status ON job_listings(is_active);
CREATE INDEX idx_blog_post_tags_tag ON blog_post_tags(tag_id);
CREATE INDEX idx_blog_post_tags_post ON blog_post_tags(post_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_corporate_teambuildings_updated_at
    BEFORE UPDATE ON corporate_teambuildings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_pages_updated_at
    BEFORE UPDATE ON landing_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customized_trainings_updated_at
    BEFORE UPDATE ON customized_trainings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_listings_updated_at
    BEFORE UPDATE ON job_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 