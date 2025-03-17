-- Create type for activity types
create type activity_type as enum ('outbound', 'virtual', 'hybrid', 'exploring');

-- Create the contact_submissions table
create table contact_submissions (
  id bigint primary key generated always as identity,
  name text not null,
  work_email text not null,
  preferred_destination text not null,
  phone text not null,
  number_of_pax integer not null,
  more_details text,
  activity_type activity_type not null,
  page_url text not null,
  page_heading text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'new' not null
);

-- Create indexes for faster lookups
create index contact_submissions_email_idx on contact_submissions(work_email);
create index contact_submissions_created_at_idx on contact_submissions(created_at);
create index contact_submissions_status_idx on contact_submissions(status);

-- Enable Row Level Security (RLS)
alter table contact_submissions enable row level security;

-- Create policies
create policy "Enable insert access for all users" on contact_submissions
  for insert with check (true);

create policy "Enable read access for authenticated users" on contact_submissions
  for select using (auth.role() = 'authenticated');

-- Create trigger for updated_at
create trigger set_contact_submissions_updated_at
  before update on contact_submissions
  for each row
  execute procedure handle_updated_at(); 