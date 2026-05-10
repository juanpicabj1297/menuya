alter table public.restaurant_profiles
add column if not exists image_url text;

alter table public.restaurant_profiles
add column if not exists rating numeric(2,1) check (rating >= 0 and rating <= 5);

alter table public.restaurant_profiles
add column if not exists tags text[] not null default '{}';

alter table public.menu_items
add column if not exists image_url text;
