alter table public.restaurant_profiles
add column if not exists whatsapp text;

alter table public.restaurant_profiles
add column if not exists manual_is_open boolean;

alter table public.menu_items
add column if not exists is_featured boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'restaurant_profiles_owner_user_id_key'
  ) then
    alter table public.restaurant_profiles
    add constraint restaurant_profiles_owner_user_id_key unique (owner_user_id);
  end if;
end $$;

create or replace function public.create_restaurant_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_city_id uuid;
  restaurant_name text;
begin
  select id into default_city_id
  from public.cities
  where slug = 'suipacha'
  limit 1;

  if default_city_id is null then
    insert into public.cities (name, province, slug)
    values ('Suipacha', 'Buenos Aires', 'suipacha')
    on conflict (slug) do update set name = excluded.name
    returning id into default_city_id;
  end if;

  restaurant_name := coalesce(
    nullif(new.raw_user_meta_data->>'restaurant_name', ''),
    split_part(new.email, '@', 1),
    'Mi restaurante'
  );

  insert into public.restaurant_profiles (
    owner_user_id,
    city_id,
    name,
    slug,
    category
  )
  values (
    new.id,
    default_city_id,
    restaurant_name,
    lower(regexp_replace(restaurant_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || left(new.id::text, 6),
    'Comida local'
  )
  on conflict (owner_user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists create_restaurant_profile_after_signup on auth.users;

create trigger create_restaurant_profile_after_signup
after insert on auth.users
for each row
execute function public.create_restaurant_profile_for_new_user();

insert into storage.buckets (id, name, public)
values ('restaurant-assets', 'restaurant-assets', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Restaurant assets are public'
  ) then
    create policy "Restaurant assets are public"
    on storage.objects for select
    using (bucket_id = 'restaurant-assets');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Restaurants can upload own assets'
  ) then
    create policy "Restaurants can upload own assets"
    on storage.objects for insert
    with check (
      bucket_id = 'restaurant-assets'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Restaurants can update own assets'
  ) then
    create policy "Restaurants can update own assets"
    on storage.objects for update
    using (
      bucket_id = 'restaurant-assets'
      and auth.uid()::text = (storage.foldername(name))[1]
    )
    with check (
      bucket_id = 'restaurant-assets'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Restaurants can delete own assets'
  ) then
    create policy "Restaurants can delete own assets"
    on storage.objects for delete
    using (
      bucket_id = 'restaurant-assets'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;
end $$;
