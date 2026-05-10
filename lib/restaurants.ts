import { createClient } from "@/lib/supabase/server";
import { fallbackRestaurants } from "@/lib/fallback-catalog";

const DEFAULT_CITY_SLUG = "suipacha";
const DEFAULT_RESTAURANT_IMAGE =
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80";
const DEFAULT_MENU_ITEM_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80";

type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  phone: string | null;
  is_open: boolean;
  minimum_order: number;
  estimated_time: string | null;
  image_url: string | null;
  rating: number | null;
  tags: string[] | null;
  delivery_enabled: boolean;
  cities: CityRow | CityRow[] | null;
};

type CityRow = {
  name: string;
  province: string;
  slug: string;
};

type MenuItemRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  menu_categories: MenuCategoryRow | MenuCategoryRow[] | null;
};

type MenuCategoryRow = {
  name: string;
  sort_order: number;
};

export type RestaurantSummary = {
  id: string;
  name: string;
  slug: string;
  category: string;
  phone: string;
  isOpen: boolean;
  deliveryTime: string;
  minimumOrder: string;
  rating: string;
  cover: string;
  tags: string[];
  city: {
    name: string;
    province: string;
    slug: string;
  };
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryName: string;
  categoryOrder: number;
};

export type RestaurantWithMenu = RestaurantSummary & {
  menu: MenuItem[];
};

function formatMinimumOrder(value: number) {
  if (value <= 0) {
    return "Sin minimo";
  }

  return `Pedido minimo $${value.toLocaleString("es-AR")}`;
}

function mapRestaurant(row: RestaurantRow): RestaurantSummary {
  const city = Array.isArray(row.cities) ? row.cities[0] : row.cities;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category ?? "Comida local",
    phone: row.phone ?? "5492324550000",
    isOpen: row.is_open,
    deliveryTime: row.estimated_time ?? "Consultar",
    minimumOrder: formatMinimumOrder(row.minimum_order),
    rating: (row.rating ?? 4.7).toFixed(1),
    cover: row.image_url ?? DEFAULT_RESTAURANT_IMAGE,
    tags: row.tags?.length
      ? row.tags
      : [row.delivery_enabled ? "Delivery propio" : "Retiro", "Local"],
    city: {
      name: city?.name ?? "Suipacha",
      province: city?.province ?? "Buenos Aires",
      slug: city?.slug ?? DEFAULT_CITY_SLUG
    }
  };
}

function mapMenuItem(row: MenuItemRow): MenuItem {
  const category = Array.isArray(row.menu_categories)
    ? row.menu_categories[0]
    : row.menu_categories;

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "Producto disponible en el restaurante.",
    price: row.price,
    image: row.image_url ?? DEFAULT_MENU_ITEM_IMAGE,
    categoryName: category?.name ?? "Menu",
    categoryOrder: category?.sort_order ?? 999
  };
}

export async function getRestaurantsByCity(citySlug = DEFAULT_CITY_SLUG) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurant_profiles")
    .select(
      `
        id,
        name,
        slug,
        category,
        phone,
        is_open,
        minimum_order,
        estimated_time,
        image_url,
        rating,
        tags,
        delivery_enabled,
        cities!inner (
          name,
          province,
          slug
        )
      `
    )
    .eq("cities.slug", citySlug)
    .order("is_open", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar los restaurantes: ${error.message}`);
  }

  const restaurants = (data as unknown as RestaurantRow[]).map(mapRestaurant);

  if (restaurants.length === 0 && citySlug === DEFAULT_CITY_SLUG) {
    return fallbackRestaurants;
  }

  return restaurants;
}

export async function getFeaturedRestaurants(citySlug = DEFAULT_CITY_SLUG) {
  const restaurants = await getRestaurantsByCity(citySlug);
  return restaurants.slice(0, 3);
}

export async function getRestaurantWithMenu(slug: string) {
  const supabase = await createClient();

  const { data: restaurantData, error: restaurantError } = await supabase
    .from("restaurant_profiles")
    .select(
      `
        id,
        name,
        slug,
        category,
        phone,
        is_open,
        minimum_order,
        estimated_time,
        image_url,
        rating,
        tags,
        delivery_enabled,
        cities (
          name,
          province,
          slug
        )
      `
    )
    .eq("slug", slug)
    .single();

  if (restaurantError) {
    if (restaurantError.code === "PGRST116") {
      return (
        fallbackRestaurants.find((restaurant) => restaurant.slug === slug) ??
        null
      );
    }

    throw new Error(
      `No se pudo cargar el restaurante: ${restaurantError.message}`
    );
  }

  const restaurant = mapRestaurant(restaurantData as unknown as RestaurantRow);

  const { data: menuData, error: menuError } = await supabase
    .from("menu_items")
    .select(
      `
        id,
        name,
        description,
        price,
        image_url,
        is_available,
        menu_categories (
          name,
          sort_order
        )
      `
    )
    .eq("restaurant_id", restaurant.id)
    .eq("is_available", true)
    .order("created_at", { ascending: true });

  if (menuError) {
    throw new Error(`No se pudo cargar el menu: ${menuError.message}`);
  }

  return {
    ...restaurant,
    menu: (menuData as unknown as MenuItemRow[])
      .map(mapMenuItem)
      .sort((a, b) => a.categoryOrder - b.categoryOrder)
  };
}
