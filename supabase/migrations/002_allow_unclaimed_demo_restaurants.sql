alter table public.restaurant_profiles
alter column owner_user_id drop not null;

alter table public.restaurant_profiles
drop constraint if exists restaurant_profiles_owner_user_id_fkey;

alter table public.restaurant_profiles
add constraint restaurant_profiles_owner_user_id_fkey
foreign key (owner_user_id)
references auth.users(id)
on delete set null;
