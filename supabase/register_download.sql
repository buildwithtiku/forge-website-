-- ==============================================================================
-- Forge Website: Download Registration Database Function (RPC)
-- ==============================================================================
-- Table: public.download_leads (already created)
-- RLS: Enabled, direct anon/authenticated access revoked.
--
-- This function runs with SECURITY DEFINER to safely bypass table RLS,
-- validates the email, prevents duplicates, and returns a clean JSON response.
-- ==============================================================================

create or replace function public.register_download(
  lead_email text,
  lead_source text default 'download-page'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  norm_email text := lower(trim(lead_email));
  existing_id uuid;
  new_id uuid;
begin
  -- 1. Validate email presence & basic format
  if norm_email is null or norm_email = '' or norm_email not like '%_@__%.__%' then
    return json_build_object('success', false, 'error', 'Please enter a valid email address.');
  end if;

  -- 2. Check for existing lead (duplicate prevention)
  select id into existing_id
  from public.download_leads
  where lower(email) = norm_email
  limit 1;

  if existing_id is not null then
    return json_build_object('success', true, 'alreadyRegistered', true);
  end if;

  -- 3. Insert new lead (with unique_violation exception handler for race conditions)
  begin
    insert into public.download_leads (email, source, status)
    values (norm_email, coalesce(lead_source, 'download-page'), 'registered')
    returning id into new_id;

    return json_build_object('success', true, 'alreadyRegistered', false);
  exception
    when unique_violation then
      return json_build_object('success', true, 'alreadyRegistered', true);
  end;
end;
$$;

-- Grant execution permission to anon and authenticated clients
revoke all on function public.register_download(text, text) from public;
grant execute on function public.register_download(text, text) to anon;
grant execute on function public.register_download(text, text) to authenticated;
