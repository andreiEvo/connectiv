-- Extend the new-user trigger to also seed account_type from signUp() metadata.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, building_what, city, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Membru connectiv'),
    coalesce(new.raw_user_meta_data ->> 'building_what', ''),
    coalesce((new.raw_user_meta_data ->> 'city')::public.city_slug, 'bucuresti'),
    coalesce((new.raw_user_meta_data ->> 'account_type')::public.account_type, 'individual')
  );
  return new;
end;
$$;
