create extension if not exists "pgcrypto";

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  province text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.restaurant_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  city_id uuid not null references public.cities(id),
  name text not null,
  slug text not null unique,
  description text,
  phone text,
  whatsapp text,
  address text,
  category text,
  image_url text,
  logo_url text,
  rating numeric(2,1) check (rating >= 0 and rating <= 5),
  tags text[] not null default '{}',
  is_open boolean not null default false,
  delivery_enabled boolean not null default true,
  pickup_enabled boolean not null default true,
  manual_is_open boolean,
  estimated_time text,
  created_at timestamptz not null default now(),
  unique (owner_user_id)
);

create table public.categorias_globales_menu (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon_name text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurant_profiles(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  unique (restaurant_id, name)
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurant_profiles(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  categoria_global_id uuid references public.categorias_globales_menu(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  price integer not null check (price >= 0),
  discount_price integer check (discount_price is null or discount_price >= 0),
  promo_label text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  unique (restaurant_id, name)
);

create table public.restaurant_global_categories (
  restaurant_id uuid not null references public.restaurant_profiles(id) on delete cascade,
  categoria_global_id uuid not null references public.categorias_globales_menu(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (restaurant_id, categoria_global_id)
);

create table public.horarios_restaurantes (
  id uuid primary key default gen_random_uuid(),
  restaurante uuid not null references public.restaurant_profiles(id) on delete cascade,
  dia_semana text not null check (
    dia_semana in (
      'lunes',
      'martes',
      'miercoles',
      'miércoles',
      'jueves',
      'viernes',
      'sabado',
      'sábado',
      'domingo'
    )
  ),
  horario_apertura time not null,
  horario_cierre time not null,
  created_at timestamptz not null default now(),
  unique (restaurante, dia_semana, horario_apertura, horario_cierre)
);

create type public.order_status as enum (
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled'
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurant_profiles(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  notes text,
  fulfillment_type text not null check (fulfillment_type in ('delivery', 'pickup')),
  payment_method text,
  status public.order_status not null default 'pending',
  total integer not null check (total >= 0),
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.cities enable row level security;
alter table public.restaurant_profiles enable row level security;
alter table public.categorias_globales_menu enable row level security;
alter table public.restaurant_global_categories enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.horarios_restaurantes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Anyone can read cities"
on public.cities for select
using (true);

create policy "Anyone can read restaurants"
on public.restaurant_profiles for select
using (true);

create policy "Anyone can read active global categories"
on public.categorias_globales_menu for select
using (is_active = true);

create policy "Anyone can read restaurant global categories"
on public.restaurant_global_categories for select
using (true);

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

create policy "Owners can manage their restaurant"
on public.restaurant_profiles for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "Anyone can read menu categories"
on public.menu_categories for select
using (true);

create policy "Owners can manage menu categories"
on public.menu_categories for all
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

create policy "Anyone can read available menu items"
on public.menu_items for select
using (is_available = true);

create policy "Anyone can read restaurant hours"
on public.horarios_restaurantes for select
using (true);

create policy "Owners can manage menu items"
on public.menu_items for all
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

create policy "Owners can manage restaurant hours"
on public.horarios_restaurantes for all
using (
  exists (
    select 1 from public.restaurant_profiles restaurants
    where restaurants.id = restaurante
    and restaurants.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurant_profiles restaurants
    where restaurants.id = restaurante
    and restaurants.owner_user_id = auth.uid()
  )
);

create policy "Anyone can create orders"
on public.orders for insert
with check (true);

create policy "Restaurant owners can read their orders"
on public.orders for select
using (
  exists (
    select 1 from public.restaurant_profiles restaurants
    where restaurants.id = restaurant_id
    and restaurants.owner_user_id = auth.uid()
  )
);

create policy "Restaurant owners can update their orders"
on public.orders for update
using (
  exists (
    select 1 from public.restaurant_profiles restaurants
    where restaurants.id = restaurant_id
    and restaurants.owner_user_id = auth.uid()
  )
);

create policy "Anyone can create order items"
on public.order_items for insert
with check (true);

create policy "Restaurant owners can read order items"
on public.order_items for select
using (
  exists (
    select 1
    from public.orders orders
    join public.restaurant_profiles restaurants
      on restaurants.id = orders.restaurant_id
    where orders.id = order_id
    and restaurants.owner_user_id = auth.uid()
  )
);

insert into public.cities (name, province, slug)
values ('Suipacha', 'Buenos Aires', 'suipacha')
on conflict (slug) do nothing;
