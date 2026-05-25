create extension if not exists "pgcrypto";

alter table public.restaurant_profiles enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.horarios_restaurantes enable row level security;

alter table public.restaurant_profiles
add column if not exists whatsapp text;

alter table public.restaurant_profiles
add column if not exists manual_is_open boolean;

alter table public.restaurant_profiles
add column if not exists pickup_enabled boolean not null default true;

alter table public.restaurant_profiles
add column if not exists estimated_time text;

alter table public.menu_items
add column if not exists is_featured boolean not null default false;

alter table public.menu_items
add column if not exists discount_price integer check (discount_price is null or discount_price >= 0);

alter table public.menu_items
add column if not exists promo_label text;

do $$
declare
  global_category_id_type text;
begin
  select format_type(attribute.atttypid, attribute.atttypmod)
  into global_category_id_type
  from pg_attribute attribute
  join pg_class class on class.oid = attribute.attrelid
  join pg_namespace namespace on namespace.oid = class.relnamespace
  where namespace.nspname = 'public'
    and class.relname = 'categorias_globales_menu'
    and attribute.attname = 'id'
    and not attribute.attisdropped;

  if global_category_id_type is null then
    raise exception 'No se encontro public.categorias_globales_menu.id';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'menu_items'
      and column_name = 'categoria_global_id'
  ) then
    execute format(
      'alter table public.menu_items add column categoria_global_id %s references public.categorias_globales_menu(id) on delete set null',
      global_category_id_type
    );
  end if;

  if to_regclass('public.restaurant_global_categories') is null then
    execute format(
      'create table public.restaurant_global_categories (
        id uuid primary key default gen_random_uuid(),
        restaurant_id uuid not null references public.restaurant_profiles(id) on delete cascade,
        categoria_global_id %s not null references public.categorias_globales_menu(id) on delete cascade,
        created_at timestamptz not null default now(),
        unique (restaurant_id, categoria_global_id)
      )',
      global_category_id_type
    );
  else
    alter table public.restaurant_global_categories
    add column if not exists id uuid default gen_random_uuid();

    alter table public.restaurant_global_categories
    add column if not exists created_at timestamptz not null default now();
  end if;
end $$;

alter table public.restaurant_global_categories enable row level security;

grant select on public.restaurant_global_categories to anon, authenticated;
grant insert, update, delete on public.restaurant_global_categories to authenticated;

drop policy if exists "Owners can manage their restaurant" on public.restaurant_profiles;
create policy "Owners can manage their restaurant"
on public.restaurant_profiles for all
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "Owners can manage menu categories" on public.menu_categories;
create policy "Owners can manage menu categories"
on public.menu_categories for all
using (
  exists (
    select 1
    from public.restaurant_profiles restaurants
    where restaurants.id = menu_categories.restaurant_id
      and restaurants.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurant_profiles restaurants
    where restaurants.id = menu_categories.restaurant_id
      and restaurants.owner_user_id = auth.uid()
  )
);

drop policy if exists "Owners can manage menu items" on public.menu_items;
create policy "Owners can manage menu items"
on public.menu_items for all
using (
  exists (
    select 1
    from public.restaurant_profiles restaurants
    where restaurants.id = menu_items.restaurant_id
      and restaurants.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurant_profiles restaurants
    where restaurants.id = menu_items.restaurant_id
      and restaurants.owner_user_id = auth.uid()
  )
);

drop policy if exists "Owners can manage restaurant hours" on public.horarios_restaurantes;
create policy "Owners can manage restaurant hours"
on public.horarios_restaurantes for all
using (
  exists (
    select 1
    from public.restaurant_profiles restaurants
    where restaurants.id = horarios_restaurantes.restaurante
      and restaurants.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurant_profiles restaurants
    where restaurants.id = horarios_restaurantes.restaurante
      and restaurants.owner_user_id = auth.uid()
  )
);

drop policy if exists "Anyone can read restaurant global categories" on public.restaurant_global_categories;
create policy "Anyone can read restaurant global categories"
on public.restaurant_global_categories for select
using (true);

drop policy if exists "Owners can manage restaurant global categories" on public.restaurant_global_categories;
create policy "Owners can manage restaurant global categories"
on public.restaurant_global_categories for all
using (
  exists (
    select 1
    from public.restaurant_profiles restaurants
    where restaurants.id = restaurant_global_categories.restaurant_id
      and restaurants.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurant_profiles restaurants
    where restaurants.id = restaurant_global_categories.restaurant_id
      and restaurants.owner_user_id = auth.uid()
  )
);
