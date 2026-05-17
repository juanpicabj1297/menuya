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
  whatsapp: string | null;
  manual_is_open: boolean | null;
  estimated_time: string | null;
  image_url: string | null;
  logo_url: string | null;
  rating: number | null;
  tags: string[] | null;
  delivery_enabled: boolean;
  cities: CityRow | CityRow[] | null;
};

type GlobalCategoryRow = {
  [key: string]: unknown;
};

type RestaurantHoursRow = {
  [key: string]: unknown;
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
  is_featured?: boolean;
  menu_categories: MenuCategoryRow | MenuCategoryRow[] | null;
  restaurant_profiles?:
    | {
        name: string | null;
        slug: string | null;
        logo_url: string | null;
      }
    | {
        name: string | null;
        slug: string | null;
        logo_url: string | null;
      }[]
    | null;
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
  phone: string | null;
  isOpen: boolean;
  scheduleStatus: "open" | "closed" | "unknown";
  scheduleLabel: string;
  scheduleHint: string | null;
  deliveryTime: string;
  rating: string | null;
  cover: string;
  logoUrl: string | null;
  tags: string[];
  city: {
    name: string;
    province: string;
    slug: string;
  };
  hours: RestaurantHour[];
};

export type RestaurantHour = {
  id: string;
  dayOfWeek: number;
  dayLabel: string;
  openTime: string;
  closeTime: string;
};

export type GlobalCategory = {
  id: string;
  name: string;
  slug: string;
  iconName: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryName: string;
  categoryOrder: number;
  restaurantName?: string;
  restaurantLogoUrl?: string | null;
  restaurantSlug?: string;
};

export type RestaurantWithMenu = RestaurantSummary & {
  menu: MenuItem[];
};

const dayLabels = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado"
];

const dayNameToIndex: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  sábado: 6
};

const normalizedDayNameToIndex: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6
};

function normalizeComparableText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function getStringValue(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getNumberValue(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return null;
}

function normalizeDayOfWeek(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value >= 0 && value <= 6) {
      return value;
    }

    if (value >= 1 && value <= 7) {
      return value % 7;
    }
  }

  if (typeof value === "string") {
    const normalized = normalizeComparableText(value);
    const numeric = Number(normalized);

    if (!Number.isNaN(numeric)) {
      return normalizeDayOfWeek(numeric);
    }

    return normalizedDayNameToIndex[normalized] ?? dayNameToIndex[normalized] ?? null;
  }

  return null;
}

function normalizeTime(value: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

function mapRestaurantHour(row: RestaurantHoursRow): RestaurantHour | null {
  const dayOfWeek = normalizeDayOfWeek(
    row.dia_semana ?? row["día_semana"] ?? row.day_of_week ?? row.weekday
  );
  const openTime = normalizeTime(
    getStringValue(row, ["horario_apertura", "hora_apertura", "open_time", "opens_at"])
  );
  const closeTime = normalizeTime(
    getStringValue(row, ["horario_cierre", "hora_cierre", "close_time", "closes_at"])
  );

  if (dayOfWeek === null || !openTime || !closeTime) {
    return null;
  }

  return {
    id:
      getStringValue(row, ["id"]) ??
      `${dayOfWeek}-${openTime}-${closeTime}`,
    dayOfWeek,
    dayLabel: dayLabels[dayOfWeek],
    openTime,
    closeTime
  };
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getArgentinaTimeParts() {
  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "domingo";
  const hour =
    Number(parts.find((part) => part.type === "hour")?.value ?? "0") % 24;
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const dayOfWeek = normalizeDayOfWeek(weekday);

  return {
    dayOfWeek: dayOfWeek ?? 0,
    minutes: hour * 60 + minute
  };
}

function getScheduleStatus(hours: RestaurantHour[]) {
  if (hours.length === 0) {
    return {
      isOpen: false,
      scheduleStatus: "unknown" as const,
      scheduleLabel: "Consultar horario",
      scheduleHint: null
    };
  }

  const now = getArgentinaTimeParts();
  const openHour = hours.find((hour) => {
    const opensAt = timeToMinutes(hour.openTime);
    const closesAt = timeToMinutes(hour.closeTime);

    if (closesAt < opensAt) {
      const nextDay = (hour.dayOfWeek + 1) % 7;

      return (
        (hour.dayOfWeek === now.dayOfWeek && now.minutes >= opensAt) ||
        (nextDay === now.dayOfWeek && now.minutes <= closesAt)
      );
    }

    if (hour.dayOfWeek !== now.dayOfWeek) {
      return false;
    }

    return now.minutes >= opensAt && now.minutes <= closesAt;
  });

  if (openHour) {
    return {
      isOpen: true,
      scheduleStatus: "open" as const,
      scheduleLabel: "Abierto ahora",
      scheduleHint: `Cierra a las ${openHour.closeTime}`
    };
  }

  const nextOpening = hours
    .flatMap((hour) => {
      return [0, 1].map((weekOffset) => {
        const dayDistance =
          (hour.dayOfWeek - now.dayOfWeek + 7) % 7 + weekOffset * 7;

        return {
          hour,
          minutesUntil:
            dayDistance * 24 * 60 + timeToMinutes(hour.openTime) - now.minutes
        };
      });
    })
    .filter((opening) => opening.minutesUntil > 0)
    .sort((a, b) => a.minutesUntil - b.minutesUntil)[0];

  return {
    isOpen: false,
    scheduleStatus: "closed" as const,
    scheduleLabel: "Cerrado",
    scheduleHint: nextOpening
      ? `Abre a las ${nextOpening.hour.openTime}`
      : null
  };
}

function mapRestaurant(row: RestaurantRow, hours: RestaurantHour[] = []): RestaurantSummary {
  const city = Array.isArray(row.cities) ? row.cities[0] : row.cities;
  const schedule =
    row.manual_is_open === null
      ? getScheduleStatus(hours)
      : {
          isOpen: row.manual_is_open,
          scheduleStatus: row.manual_is_open ? ("open" as const) : ("closed" as const),
          scheduleLabel: row.manual_is_open ? "Abierto ahora" : "Cerrado",
          scheduleHint: null
        };

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category ?? "Comida local",
    phone: row.whatsapp ?? row.phone,
    isOpen: schedule.isOpen,
    scheduleStatus: schedule.scheduleStatus,
    scheduleLabel: schedule.scheduleLabel,
    scheduleHint: schedule.scheduleHint,
    deliveryTime: row.estimated_time ?? "Horario a confirmar",
    rating: row.rating === null ? null : row.rating.toFixed(1),
    cover: row.image_url ?? DEFAULT_RESTAURANT_IMAGE,
    logoUrl: row.logo_url,
    tags: row.tags?.length
      ? row.tags
      : [row.delivery_enabled ? "Delivery propio" : "Retiro", "Local"],
    city: {
      name: city?.name ?? "Suipacha",
      province: city?.province ?? "Buenos Aires",
      slug: city?.slug ?? DEFAULT_CITY_SLUG
    },
    hours
  };
}

function mapMenuItem(row: MenuItemRow): MenuItem {
  const category = Array.isArray(row.menu_categories)
    ? row.menu_categories[0]
    : row.menu_categories;
  const restaurant = Array.isArray(row.restaurant_profiles)
    ? row.restaurant_profiles[0]
    : row.restaurant_profiles;

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "Producto disponible en el restaurante.",
    price: row.price,
    image: row.image_url ?? DEFAULT_MENU_ITEM_IMAGE,
    categoryName: category?.name ?? "Menu",
    categoryOrder: category?.sort_order ?? 999,
    restaurantName: restaurant?.name ?? undefined,
    restaurantLogoUrl: restaurant?.logo_url ?? null,
    restaurantSlug: restaurant?.slug ?? undefined
  };
}

function getRestaurantIdFromHoursRow(row: RestaurantHoursRow) {
  const directValue = row.restaurante ?? row.restaurant;

  if (directValue && typeof directValue === "object" && !Array.isArray(directValue)) {
    const restaurant = directValue as Record<string, unknown>;
    return getStringValue(restaurant, ["id", "slug", "name", "nombre"]);
  }

  return getStringValue(row, [
    "restaurante",
    "restaurant_id",
    "restaurante_id",
    "restaurant",
    "restaurant_slug",
    "restaurante_slug",
    "slug",
    "nombre_restaurante"
  ]);
}

async function getHoursByRestaurants(restaurants: RestaurantRow[]) {
  if (restaurants.length === 0) {
    return new Map<string, RestaurantHour[]>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("horarios_restaurantes")
    .select("*");

  const rows = error ? [] : ((data ?? []) as RestaurantHoursRow[]);
  const restaurantLookup = new Map<string, string>();

  restaurants.forEach((restaurant) => {
    [restaurant.id, restaurant.slug, restaurant.name].forEach((value) => {
      restaurantLookup.set(normalizeComparableText(value), restaurant.id);
    });
  });

  const hoursByRestaurant = new Map<string, RestaurantHour[]>();

  rows.forEach((row) => {
    const restaurantKey = getRestaurantIdFromHoursRow(row);
    const restaurantId = restaurantKey
      ? restaurantLookup.get(normalizeComparableText(restaurantKey))
      : null;
    const hour = mapRestaurantHour(row);

    if (!restaurantId || !hour) {
      return;
    }

    const current = hoursByRestaurant.get(restaurantId) ?? [];
    hoursByRestaurant.set(restaurantId, [...current, hour]);
  });

  hoursByRestaurant.forEach((hours, restaurantId) => {
    hoursByRestaurant.set(
      restaurantId,
      hours.sort(
        (a, b) =>
          a.dayOfWeek - b.dayOfWeek ||
          timeToMinutes(a.openTime) - timeToMinutes(b.openTime)
      )
    );
  });

  return hoursByRestaurant;
}

async function getHoursByRestaurant(restaurant: RestaurantRow) {
  const hours = await getHoursByRestaurants([restaurant]);
  return hours.get(restaurant.id) ?? [];
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
        whatsapp,
        manual_is_open,
        estimated_time,
        image_url,
        logo_url,
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
    .order("name", { ascending: true });

  if (error) {
    if (citySlug === DEFAULT_CITY_SLUG) {
      return fallbackRestaurants;
    }

    throw new Error(`No se pudieron cargar los restaurantes: ${error.message}`);
  }

  const restaurantRows = data as unknown as RestaurantRow[];
  const hoursByRestaurant = await getHoursByRestaurants(restaurantRows);
  const restaurants = restaurantRows
    .map((restaurant) =>
      mapRestaurant(restaurant, hoursByRestaurant.get(restaurant.id) ?? [])
    )
    .sort((a, b) => Number(b.isOpen) - Number(a.isOpen));

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
        whatsapp,
        manual_is_open,
        estimated_time,
        image_url,
        logo_url,
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

    const fallbackRestaurant = fallbackRestaurants.find(
      (restaurant) => restaurant.slug === slug
    );

    if (fallbackRestaurant) {
      return fallbackRestaurant;
    }

    throw new Error(
      `No se pudo cargar el restaurante: ${restaurantError.message}`
    );
  }

  const restaurantRow = restaurantData as unknown as RestaurantRow;
  const restaurant = mapRestaurant(
    restaurantRow,
    await getHoursByRestaurant(restaurantRow)
  );

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

export async function getGlobalCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias_globales_menu")
    .select("*");

  if (error) {
    return [];
  }

  if (!data?.length) {
    return [];
  }

  return (data as GlobalCategoryRow[])
    .filter((category) => {
      const activeValue = category.is_active ?? category.activo ?? category.active;

      if (activeValue === undefined || activeValue === null) {
        return true;
      }

      if (typeof activeValue === "string") {
        return activeValue.toLowerCase() !== "false";
      }

      if (typeof activeValue === "number") {
        return activeValue !== 0;
      }

      return activeValue === true;
    })
    .map((category, index) => {
      const name =
        getStringValue(category, [
          "name",
          "nombre",
          "categoria",
          "nombre_categoria",
          "titulo",
          "label"
        ]) ??
        "Categoria";
      const slug =
        getStringValue(category, ["slug"]) ??
        name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      return {
        id: getStringValue(category, ["id"]) ?? slug,
        name,
        slug,
        iconName:
          getStringValue(category, ["icon_name", "icono", "icon", "icon_name_menu"]) ??
          "utensils",
        sortOrder:
          getNumberValue(category, ["sort_order", "orden", "order", "position"]) ??
          index
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      iconName: category.iconName
    }));
}

export async function getFeaturedMenuItems(citySlug = DEFAULT_CITY_SLUG) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      `
        id,
        name,
        description,
        price,
        image_url,
        is_available,
        is_featured,
        restaurant_profiles!inner (
          name,
          slug,
          logo_url,
          cities!inner (
            slug
          )
        ),
        menu_categories (
          name,
          sort_order
        )
      `
    )
    .eq("is_available", true)
    .eq("restaurant_profiles.cities.slug", citySlug)
    .order("is_featured", { ascending: false })
    .limit(6);

  if (error || !data?.length) {
    return fallbackRestaurants
      .flatMap((restaurant) =>
        restaurant.menu.map((item) => ({
          ...item,
          restaurantName: restaurant.name,
          restaurantLogoUrl: restaurant.logoUrl,
          restaurantSlug: restaurant.slug
        }))
      )
      .slice(0, 6);
  }

  return (data as unknown as MenuItemRow[]).map(mapMenuItem).slice(0, 6);
}
