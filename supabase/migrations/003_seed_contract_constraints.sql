do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
    and table_name = 'restaurant_profiles'
    and column_name = 'image_url'
  ) then
    alter table public.restaurant_profiles add column image_url text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
    and table_name = 'restaurant_profiles'
    and column_name = 'rating'
  ) then
    alter table public.restaurant_profiles
    add column rating numeric(2,1) check (rating >= 0 and rating <= 5);
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
    and table_name = 'restaurant_profiles'
    and column_name = 'tags'
  ) then
    alter table public.restaurant_profiles
    add column tags text[] not null default '{}';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
    and table_name = 'menu_items'
    and column_name = 'image_url'
  ) then
    alter table public.menu_items add column image_url text;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'menu_categories_restaurant_id_name_key'
  ) then
    alter table public.menu_categories
    add constraint menu_categories_restaurant_id_name_key
    unique (restaurant_id, name);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'menu_items_restaurant_id_name_key'
  ) then
    alter table public.menu_items
    add constraint menu_items_restaurant_id_name_key
    unique (restaurant_id, name);
  end if;
end $$;
