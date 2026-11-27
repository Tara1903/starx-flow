alter table public.workflows add column edit_version bigint not null default 0;

create function public.bump_workflow_edit_version() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.edit_version := old.edit_version + 1;
  return new;
end;
$$;

create trigger workflow_edit_version
before update of name, description, trigger, action, is_active, channel, ai_tone, custom_prompt, config
on public.workflows for each row execute function public.bump_workflow_edit_version();
