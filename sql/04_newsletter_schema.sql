-- Create the newsletter_subscriptions table
create table newsletter_subscriptions (
  id bigint primary key generated always as identity,
  email text not null unique,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on email for faster lookups
create index newsletter_subscriptions_email_idx on newsletter_subscriptions(email);

-- Enable Row Level Security (RLS)
alter table newsletter_subscriptions enable row level security;

-- Create policies
create policy "Enable read access for authenticated users" on newsletter_subscriptions
  for select using (auth.role() = 'authenticated');

create policy "Enable insert access for all users" on newsletter_subscriptions
  for insert with check (true);

-- Create function to handle updates
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_updated_at
  before update on newsletter_subscriptions
  for each row
  execute procedure handle_updated_at(); 