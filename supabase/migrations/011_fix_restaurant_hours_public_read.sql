alter table public.horarios_restaurantes enable row level security;

grant select on public.horarios_restaurantes to anon, authenticated;
grant insert, update, delete on public.horarios_restaurantes to authenticated;

drop policy if exists "Anyone can read restaurant hours" on public.horarios_restaurantes;
create policy "Anyone can read restaurant hours"
on public.horarios_restaurantes for select
using (true);

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
