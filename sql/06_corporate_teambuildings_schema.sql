-- Corporate Teambuildings Table Schema
-- This table stores corporate team building activities and their content

DROP TABLE IF EXISTS corporate_teambuildings CASCADE;

CREATE TABLE public.corporate_teambuildings (
  id serial NOT NULL,
  name character varying(255) NOT NULL,
  slug character varying(255) NOT NULL,
  collection_id character varying(255) NULL,
  locale_id character varying(255) NULL,
  item_id character varying(255) NULL,
  target_keyword text NULL,
  main_heading text NULL,
  meta_description text NULL,
  tagline text NULL,
  heading_2 text NULL,
  heading_2_argument text NULL,
  heading_3_satire text NULL,
  heading_3 text NULL,
  heading_3_argument_1 text NULL,
  heading_3_argument_2 text NULL,
  heading_4 text NULL,
  reason_1_heading text NULL,
  reason_1_paragraph text NULL,
  reason_2_heading text NULL,
  reason_2_paragraph text NULL,
  reason_3_heading text NULL,
  reason_3_paragraph text NULL,
  reason_4_heading text NULL,
  reason_4_paragraph text NULL,
  reason_5_heading text NULL,
  reason_5_paragraph text NULL,
  form_cta_heading text NULL,
  form_cta_paragraph text NULL,
  button_text text NULL,
  special_section_heading text NULL,
  card_1_heading text NULL,
  card_2_heading text NULL,
  card_3_heading text NULL,
  card_4_heading text NULL,
  card_1_image text NULL,
  card_2_image text NULL,
  card_3_image text NULL,
  card_4_image text NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  published_at timestamp with time zone NULL,
  CONSTRAINT corporate_teambuildings_pkey PRIMARY KEY (id),
  CONSTRAINT corporate_teambuildings_slug_key UNIQUE (slug)
) TABLESPACE pg_default;

-- Add indexes for better performance
CREATE INDEX idx_corporate_teambuildings_slug ON corporate_teambuildings(slug);
CREATE INDEX idx_corporate_teambuildings_published_at ON corporate_teambuildings(published_at);
CREATE INDEX idx_corporate_teambuildings_created_at ON corporate_teambuildings(created_at);

-- Add trigger for updated_at
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

-- Sample data for testing
INSERT INTO corporate_teambuildings (
    name,
    slug,
    target_keyword,
    main_heading,
    meta_description,
    tagline,
    heading_2,
    heading_2_argument,
    heading_3,
    heading_3_argument_1,
    heading_4,
    reason_1_heading,
    reason_1_paragraph,
    reason_2_heading,
    reason_2_paragraph,
    reason_3_heading,
    reason_3_paragraph,
    form_cta_heading,
    form_cta_paragraph,
    button_text,
    special_section_heading,
    card_1_heading,
    card_2_heading,
    card_3_heading,
    card_4_heading,
    published_at
) VALUES (
    'Leadership Development Program',
    'leadership-development-program',
    'leadership development, corporate training, team leadership',
    'Transform Your Team with Professional Leadership Development',
    'Enhance your team''s leadership capabilities with our comprehensive leadership development program. Build stronger leaders and improve team performance.',
    'Empower Your Leaders',
    'Why Leadership Development Matters',
    '<p>In today''s competitive business environment, strong leadership is the cornerstone of organizational success. Our leadership development program is designed to identify, nurture, and enhance leadership qualities within your team.</p>',
    'Our Comprehensive Approach',
    '<p>We use a multi-faceted approach that combines theoretical knowledge with practical application, ensuring that participants can immediately implement what they learn.</p>',
    'Key Benefits of Our Program',
    'Enhanced Decision-Making Skills',
    '<p>Learn to make informed decisions under pressure and guide your team through complex challenges with confidence and clarity.</p>',
    'Improved Communication',
    '<p>Develop powerful communication skills that inspire, motivate, and align your team towards common goals and objectives.</p>',
    'Strategic Thinking',
    '<p>Master the art of strategic planning and long-term vision development to drive sustainable organizational growth.</p>',
    'Ready to Develop Your Leaders?',
    '<p>Take the first step towards building a stronger leadership team. Our expert facilitators will work with you to create a customized program that meets your specific needs.</p>',
    'Get Started Today',
    'Program Components',
    'Interactive Workshops',
    'Case Study Analysis',
    'Role-Playing Exercises',
    'Peer Learning Sessions',
    NOW()
);

-- Add comment to table
COMMENT ON TABLE corporate_teambuildings IS 'Stores corporate team building activities and programs with their detailed content and metadata'; 