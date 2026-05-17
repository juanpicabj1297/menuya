create table if not exists public.horarios_restaurantes (
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

alter table public.horarios_restaurantes enable row level security;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'horarios_restaurantes'
      and column_name = 'dia_semana'
      and data_type <> 'text'
  ) then
    alter table public.horarios_restaurantes
    drop constraint if exists horarios_restaurantes_dia_semana_check;

    alter table public.horarios_restaurantes
    alter column dia_semana type text
    using case dia_semana::integer
      when 0 then 'domingo'
      when 1 then 'lunes'
      when 2 then 'martes'
      when 3 then 'miercoles'
      when 4 then 'jueves'
      when 5 then 'viernes'
      when 6 then 'sabado'
      else dia_semana::text
    end;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'horarios_restaurantes_dia_semana_check'
  ) then
    alter table public.horarios_restaurantes
    add constraint horarios_restaurantes_dia_semana_check
    check (
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
    );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'horarios_restaurantes_unique_slot'
  ) then
    alter table public.horarios_restaurantes
    add constraint horarios_restaurantes_unique_slot
    unique (restaurante, dia_semana, horario_apertura, horario_cierre);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'horarios_restaurantes'
      and policyname = 'Anyone can read restaurant hours'
  ) then
    create policy "Anyone can read restaurant hours"
    on public.horarios_restaurantes for select
    using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'horarios_restaurantes'
      and policyname = 'Owners can manage restaurant hours'
  ) then
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
  end if;
end $$;
