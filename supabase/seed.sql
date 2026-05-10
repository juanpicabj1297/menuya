insert into public.cities (name, province, slug)
values ('Suipacha', 'Buenos Aires', 'suipacha')
on conflict (slug) do nothing;

insert into public.restaurant_profiles (
  city_id,
  name,
  slug,
  description,
  phone,
  category,
  image_url,
  rating,
  tags,
  is_open,
  delivery_enabled,
  pickup_enabled,
  minimum_order,
  estimated_time
)
select
  cities.id,
  restaurant.name,
  restaurant.slug,
  restaurant.description,
  restaurant.phone,
  restaurant.category,
  restaurant.image_url,
  restaurant.rating,
  restaurant.tags,
  restaurant.is_open,
  true,
  true,
  restaurant.minimum_order,
  restaurant.estimated_time
from public.cities
cross join (
  values
    (
      'La Esquina',
      'la-esquina',
      'Pizzas, empanadas y clasicos para pedir en familia.',
      '5492324550000',
      'Pizzas y empanadas',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
      4.8::numeric,
      array['Familiar', 'Delivery propio', 'Mas pedido'],
      true,
      6000,
      '30-45 min'
    ),
    (
      'Burger Suipacha',
      'burger-suipacha',
      'Hamburguesas, combos y papas para pedir rapido.',
      '5492324550001',
      'Hamburguesas',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
      4.7::numeric,
      array['Rapido', 'Combos', 'Abierto'],
      true,
      7500,
      '25-40 min'
    ),
    (
      'Rotiseria Centro',
      'rotiseria-centro',
      'Minutas y platos caseros del dia.',
      '5492324550002',
      'Minutas y platos del dia',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
      4.6::numeric,
      array['Casero', 'Retiro', 'Menu del dia'],
      true,
      5500,
      '35-50 min'
    )
) as restaurant (
  name,
  slug,
  description,
  phone,
  category,
  image_url,
  rating,
  tags,
  is_open,
  minimum_order,
  estimated_time
)
where cities.slug = 'suipacha'
on conflict (slug) do update set
  description = excluded.description,
  phone = excluded.phone,
  category = excluded.category,
  image_url = excluded.image_url,
  rating = excluded.rating,
  tags = excluded.tags,
  is_open = excluded.is_open,
  delivery_enabled = excluded.delivery_enabled,
  pickup_enabled = excluded.pickup_enabled,
  minimum_order = excluded.minimum_order,
  estimated_time = excluded.estimated_time;

insert into public.menu_categories (restaurant_id, name, sort_order)
select restaurants.id, category.name, category.sort_order
from public.restaurant_profiles restaurants
cross join (
  values
    ('la-esquina', 'Pizzas', 1),
    ('la-esquina', 'Empanadas', 2),
    ('burger-suipacha', 'Hamburguesas', 1),
    ('burger-suipacha', 'Acompanamientos', 2),
    ('rotiseria-centro', 'Minutas', 1),
    ('rotiseria-centro', 'Platos del dia', 2)
) as category (restaurant_slug, name, sort_order)
where restaurants.slug = category.restaurant_slug
on conflict (restaurant_id, name) do update set
  sort_order = excluded.sort_order;

insert into public.menu_items (
  restaurant_id,
  category_id,
  name,
  description,
  image_url,
  price,
  is_available
)
select
  restaurants.id,
  categories.id,
  item.name,
  item.description,
  item.image_url,
  item.price,
  true
from public.restaurant_profiles restaurants
join (
  values
    (
      'la-esquina',
      'Pizzas',
      'Pizza muzzarella',
      'Salsa de tomate, muzzarella y aceitunas.',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
      8500
    ),
    (
      'la-esquina',
      'Empanadas',
      'Empanadas surtidas',
      'Carne, jamon y queso, pollo o verdura.',
      'https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&w=600&q=80',
      1300
    ),
    (
      'burger-suipacha',
      'Hamburguesas',
      'Hamburguesa completa',
      'Medallon, queso, lechuga, tomate, huevo y papas.',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      9200
    ),
    (
      'burger-suipacha',
      'Acompanamientos',
      'Papas cheddar',
      'Papas fritas con cheddar y verdeo.',
      'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80',
      5200
    ),
    (
      'rotiseria-centro',
      'Minutas',
      'Milanesa con papas',
      'Milanesa de carne o pollo con guarnicion.',
      'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=600&q=80',
      8900
    ),
    (
      'rotiseria-centro',
      'Platos del dia',
      'Tarta individual',
      'Opciones segun disponibilidad del dia.',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      4700
    )
) as item (
  restaurant_slug,
  category_name,
  name,
  description,
  image_url,
  price
)
  on restaurants.slug = item.restaurant_slug
join public.menu_categories categories
  on categories.restaurant_id = restaurants.id
  and categories.name = item.category_name
on conflict (restaurant_id, name) do update set
  category_id = excluded.category_id,
  description = excluded.description,
  image_url = excluded.image_url,
  price = excluded.price,
  is_available = excluded.is_available;
