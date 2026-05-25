alter table public.order_items
add column if not exists created_at timestamptz not null default now();

create or replace function public.get_most_ordered_menu_item_ids(
  result_limit integer default 24,
  city_slug text default 'suipacha'
)
returns table (
  menu_item_id uuid,
  total_quantity bigint
)
language sql
security definer
set search_path = public
as $$
  select
    order_items.menu_item_id,
    sum(order_items.quantity)::bigint as total_quantity
  from public.order_items
  join public.orders
    on orders.id = order_items.order_id
  join public.restaurant_profiles restaurants
    on restaurants.id = orders.restaurant_id
  join public.cities
    on cities.id = restaurants.city_id
  join public.menu_items
    on menu_items.id = order_items.menu_item_id
  where order_items.menu_item_id is not null
    and menu_items.is_available = true
    and cities.slug = city_slug
  group by order_items.menu_item_id
  order by sum(order_items.quantity) desc, max(order_items.created_at) desc
  limit greatest(result_limit, 1);
$$;

grant execute on function public.get_most_ordered_menu_item_ids(integer, text)
to anon, authenticated;
