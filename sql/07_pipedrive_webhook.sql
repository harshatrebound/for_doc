-- Enable HTTP extension for webhooks
create extension if not exists http with schema extensions;

-- Create a function to call the Pipedrive webhook
create or replace function handle_new_contact_submission()
returns trigger
language plpgsql
security definer
as $$
declare
  webhook_url text := 'https://yrppmcoycmydrujbesnd.supabase.co/functions/v1/pipedrive-webhook';
  payload json;
begin
  -- Create the payload with the new contact submission
  payload := json_build_object(
    'type', 'INSERT',
    'table', 'contact_submissions',
    'record', row_to_json(NEW)
  );

  -- Call the webhook asynchronously
  perform
    extensions.http((
      'POST',
      webhook_url,
      ARRAY[
        extensions.http_header('Content-Type', 'application/json'),
        extensions.http_header('Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'))
      ],
      payload::text
    ));

  return NEW;
end;
$$;

-- Create the trigger
drop trigger if exists contact_submission_pipedrive_trigger on contact_submissions;

create trigger contact_submission_pipedrive_trigger
  after insert on contact_submissions
  for each row
  execute function handle_new_contact_submission();

-- Grant necessary permissions
grant usage on schema extensions to anon, authenticated;
grant execute on function extensions.http to anon, authenticated;
grant execute on function handle_new_contact_submission to anon, authenticated; 