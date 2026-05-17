create table if not exists public.categorias_globales_menu (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon_name text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.categorias_globales_menu enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
    and tablename = 'categorias_globales_menu'
    and policyname = 'Anyone can read active global categories'
  ) then
    create policy "Anyone can read active global categories"
    on public.categorias_globales_menu for select
    using (is_active = true);
  end if;
end $$;

alter table public.restaurant_profiles
add column if not exists logo_url text;
