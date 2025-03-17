I'll create a comprehensive markdown with SQL for 12 essential tables based on the team building activities data structure. I'll include table creation, indexes, and some example queries.

```markdown
# Trebound Database Schema

## Table Structure and Queries

### 1. Activity Tags
```sql
create table activity_tags (
    id uuid default uuid_generate_v4() primary key,
    name varchar not null,
    slug varchar unique not null,
    description text,
    meta_title varchar,
    meta_description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create index activity_tags_slug_idx on activity_tags(slug);
```

### 2. Activities
```sql
create table activities (
    id uuid default uuid_generate_v4() primary key,
    name varchar not null,
    slug varchar unique not null,
    tagline varchar,
    description text,
    activity_type varchar,
    group_size_min int,
    group_size_max int,
    duration_minutes int,
    target_areas text[],
    price decimal(10,2),
    main_image_url text,
    video_url text,
    meta_title varchar,
    meta_description text,
    activity_level varchar check (activity_level in ('Low', 'Medium', 'High')),
    is_mainstream boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create index activities_slug_idx on activities(slug);
create index activities_activity_type_idx on activities(activity_type);
```

### 3. Activity Tag Relations
```sql
create table activity_tag_relations (
    activity_id uuid references activities(id) on delete cascade,
    tag_id uuid references activity_tags(id) on delete cascade,
    primary key (activity_id, tag_id)
);
```

### 4. Activity Blueprints
```sql
create table activity_blueprints (
    id uuid default uuid_generate_v4() primary key,
    activity_id uuid references activities(id) on delete cascade,
    materials_required text[],
    setup_instructions text,
    execution_steps text[],
    safety_guidelines text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
```

### 5. Regions
```sql
create table regions (
    id uuid default uuid_generate_v4() primary key,
    name varchar not null,
    slug varchar unique not null,
    description text,
    meta_title varchar,
    meta_description text,
    image_url text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create index regions_slug_idx on regions(slug);
```

### 6. Activity Locations
```sql
create table activity_locations (
    id uuid default uuid_generate_v4() primary key,
    activity_id uuid references activities(id) on delete cascade,
    region_id uuid references regions(id) on delete cascade,
    venue_name varchar,
    address text,
    latitude decimal(10,8),
    longitude decimal(11,8),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create index activity_locations_activity_id_idx on activity_locations(activity_id);
create index activity_locations_region_id_idx on activity_locations(region_id);
```

### 7. Bookings
```sql
create table bookings (
    id uuid default uuid_generate_v4() primary key,
    activity_id uuid references activities(id) on delete restrict,
    customer_name varchar not null,
    customer_email varchar not null,
    customer_phone varchar,
    group_size int not null,
    booking_date date not null,
    status varchar check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
    total_amount decimal(10,2) not null,
    special_requirements text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create index bookings_customer_email_idx on bookings(customer_email);
create index bookings_booking_date_idx on bookings(booking_date);
```

### 8. Reviews
```sql
create table reviews (
    id uuid default uuid_generate_v4() primary key,
    activity_id uuid references activities(id) on delete cascade,
    booking_id uuid references bookings(id) on delete set null,
    customer_name varchar not null,
    rating int check (rating between 1 and 5),
    review_text text,
    is_verified boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create index reviews_activity_id_idx on reviews(activity_id);
```

### 9. Activity Images
```sql
create table activity_images (
    id uuid default uuid_generate_v4() primary key,
    activity_id uuid references activities(id) on delete cascade,
    image_url text not null,
    alt_text varchar,
    is_featured boolean default false,
    display_order int,
    created_at timestamp with time zone default now()
);

create index activity_images_activity_id_idx on activity_images(activity_id);
```

### 10. Contact Inquiries
```sql
create table contact_inquiries (
    id uuid default uuid_generate_v4() primary key,
    name varchar not null,
    email varchar not null,
    phone varchar,
    message text,
    status varchar check (status in ('new', 'in_progress', 'responded', 'closed')),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create index contact_inquiries_email_idx on contact_inquiries(email);
create index contact_inquiries_status_idx on contact_inquiries(status);
```

### 11. Activity Pricing Tiers
```sql
create table activity_pricing_tiers (
    id uuid default uuid_generate_v4() primary key,
    activity_id uuid references activities(id) on delete cascade,
    tier_name varchar not null,
    min_participants int not null,
    max_participants int not null,
    price_per_person decimal(10,2) not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    constraint valid_participant_range check (min_participants <= max_participants)
);

create index activity_pricing_tiers_activity_id_idx on activity_pricing_tiers(activity_id);
```

### 12. Activity Categories
```sql
create table activity_categories (
    id uuid default uuid_generate_v4() primary key,
    name varchar not null,
    slug varchar unique not null,
    description text,
    display_order int,
    parent_category_id uuid references activity_categories(id) on delete set null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create index activity_categories_slug_idx on activity_categories(slug);
create index activity_categories_parent_id_idx on activity_categories(parent_category_id);
```

## Common Queries

### Find Activities by Category with Pricing
```sql
select 
    a.name,
    a.description,
    a.activity_type,
    apt.tier_name,
    apt.min_participants,
    apt.max_participants,
    apt.price_per_person
from activities a
join activity_categories ac on ac.id = a.category_id
join activity_pricing_tiers apt on apt.activity_id = a.id
where ac.slug = 'team-building'
order by apt.price_per_person asc;
```

### Get Activity Details with Reviews
```sql
select 
    a.name,
    a.description,
    avg(r.rating) as average_rating,
    count(r.id) as review_count,
    array_agg(distinct t.name) as tags
from activities a
left join reviews r on r.activity_id = a.id
left join activity_tag_relations atr on atr.activity_id = a.id
left join activity_tags t on t.id = atr.tag_id
where a.slug = 'drum-jam-session'
group by a.id;
```

### Find Available Activities by Group Size
```sql
select distinct 
    a.name,
    a.activity_type,
    a.duration_minutes,
    min(apt.price_per_person) as min_price
from activities a
join activity_pricing_tiers apt on apt.activity_id = a.id
where 50 between apt.min_participants and apt.max_participants
group by a.id, a.name, a.activity_type, a.duration_minutes
order by min_price asc;
```

```sql
-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activities Table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    image_url VARCHAR(255),
    duration_minutes INTEGER,
    min_participants INTEGER,
    max_participants INTEGER,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('Easy', 'Moderate', 'Challenging')),
    is_outbound BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    price_per_person DECIMAL(10,2),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity Tags (Junction Table)
CREATE TABLE activity_tags (
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (activity_id, tag_id)
);

-- Indexes
CREATE INDEX idx_activities_category ON activities(category_id);
CREATE INDEX idx_activities_slug ON activities(slug);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_activity_tags_tag ON activity_tags(tag_id);
CREATE INDEX idx_activity_tags_activity ON activity_tags(activity_id);

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
```