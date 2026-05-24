alter table public.restaurant_profiles
add column if not exists whatsapp text;

alter table public.restaurant_profiles
add column if not exists manual_is_open boolean;

alter table public.menu_items
add column if not exists is_featured boolean not null default false;

alter table public.menu_items
add column if not exists discount_price integer check (discount_price is null or discount_price >= 0);

alter table public.menu_items
add column if not exists promo_label text;

alter table public.menu_items
add column if not exists categoria_global_id uuid references public.categorias_globales_menu(id) on delete set null;

create table if not exists public.restaurant_global_categories (
  restaurant_id uuid not null references public.restaurant_profiles(id) on delete cascade,
  categoria_global_id uuid not null references public.categorias_globales_menu(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (restaurant_id, categoria_global_id)
);

alter table public.restaurant_global_categories enable row level security;

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

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'restaurant_global_categories'
      and policyname = 'Anyone can read restaurant global categories'
  ) then
    create policy "Anyone can read restaurant global categories"
    on public.restaurant_global_categories for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'restaurant_global_categories'
      and policyname = 'Owners can manage restaurant global categories'
  ) then
    create policy "Owners can manage restaurant global categories"
    on public.restaurant_global_categories for all
    using (
      exists (
        select 1 from public.restaurant_profiles restaurants
        where restaurants.id = restaurant_id
        and restaurants.owner_user_id = auth.uid()
      )
    )
    with check (
      exists (
        select 1 from public.restaurant_profiles restaurants
        where restaurants.id = restaurant_id
        and restaurants.owner_user_id = auth.uid()
      )
    );
  end if;
end $$;

create or replace function public.delete_current_restaurant_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'No authenticated user';
  end if;

  delete from public.restaurant_profiles
  where owner_user_id = current_user_id;

  delete from auth.users
  where id = current_user_id;
end;
$$;

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
