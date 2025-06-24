-- Create the partner_registrations table
create table partner_registrations (
  id bigint primary key generated always as identity,
  company_name text not null,
  website text,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  country text not null,
  city text not null,
  company_type text not null,
  employee_count text,
  years_in_business text,
  services_offered text[] not null,
  message text,
  status text default 'pending' not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for faster lookups
create index partner_registrations_email_idx on partner_registrations(email);
create index partner_registrations_status_idx on partner_registrations(status);
create index partner_registrations_created_at_idx on partner_registrations(created_at);
create index partner_registrations_company_name_idx on partner_registrations(company_name);

-- Enable Row Level Security (RLS)
alter table partner_registrations enable row level security;

-- Create policies
create policy "Enable insert access for all users" on partner_registrations
  for insert with check (true);

create policy "Enable read access for authenticated users" on partner_registrations
  for select using (auth.role() = 'authenticated');

-- Create trigger for updated_at
create trigger set_partner_registrations_updated_at
  before update on partner_registrations
  for each row
  execute procedure handle_updated_at(); 