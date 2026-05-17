"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  LogOut,
  PackagePlus,
  Plus,
  Save,
  Settings,
  Store,
  Tags,
  Trash2,
  Utensils
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";

type RestaurantPanelClientProps = {
  userId: string;
  email: string;
};

type RestaurantProfile = {
  id: string;
  owner_user_id: string;
  city_id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  category: string | null;
  image_url: string | null;
  logo_url: string | null;
  estimated_time: string | null;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  manual_is_open: boolean | null;
};

type MenuCategory = {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
};

type MenuItem = {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  is_available: boolean;
  is_featured: boolean;
};

type RestaurantHour = {
  id: string;
  restaurante: string;
  dia_semana: string;
  horario_apertura: string;
  horario_cierre: string;
};

const tabs = [
  { id: "info", label: "Información", icon: Store },
  { id: "hours", label: "Horarios", icon: CalendarDays },
  { id: "categories", label: "Categorías", icon: Tags },
  { id: "products", label: "Productos", icon: Utensils },
  { id: "account", label: "Cuenta", icon: Settings }
] as const;

type TabId = (typeof tabs)[number]["id"];

const days = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo"
];

function moneyToCents(value: string) {
  return Math.max(0, Math.round(Number(value || "0")));
}

function InputLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-black text-slate-700">{children}</label>;
}

export function RestaurantPanelClient({
  userId,
  email
}: RestaurantPanelClientProps) {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [toast, setToast] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const profileQuery = useQuery({
    queryKey: ["restaurant-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_profiles")
        .select("*")
        .eq("owner_user_id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        return data as RestaurantProfile;
      }

      const { data: city } = await supabase
        .from("cities")
        .select("id")
        .eq("slug", "suipacha")
        .single();

      if (!city?.id) {
        throw new Error("No se encontró la ciudad inicial.");
      }

      const restaurantName = email.split("@")[0] || "Mi restaurante";
      const { data: created, error: createError } = await supabase
        .from("restaurant_profiles")
        .insert({
          owner_user_id: userId,
          city_id: city?.id,
          name: restaurantName,
          slug: `${slugify(restaurantName)}-${userId.slice(0, 6)}`,
          category: "Comida local"
        })
        .select("*")
        .single();

      if (createError) {
        throw createError;
      }

      return created as RestaurantProfile;
    }
  });

  const restaurantId = profileQuery.data?.id;

  const categoriesQuery = useQuery({
    queryKey: ["restaurant-categories", restaurantId],
    enabled: Boolean(restaurantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as MenuCategory[];
    }
  });

  const productsQuery = useQuery({
    queryKey: ["restaurant-products", restaurantId],
    enabled: Boolean(restaurantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as MenuItem[];
    }
  });

  const hoursQuery = useQuery({
    queryKey: ["restaurant-hours", restaurantId],
    enabled: Boolean(restaurantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("horarios_restaurantes")
        .select("*")
        .eq("restaurante", restaurantId)
        .order("dia_semana", { ascending: true })
        .order("horario_apertura", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as RestaurantHour[];
    }
  });

  const dashboardData = useMemo(
    () => ({
      profile: profileQuery.data,
      categories: categoriesQuery.data ?? [],
      products: productsQuery.data ?? [],
      hours: hoursQuery.data ?? []
    }),
    [categoriesQuery.data, hoursQuery.data, productsQuery.data, profileQuery.data]
  );

  async function uploadAsset(file: File, folder: string) {
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${folder}/${Date.now()}.${extension}`;
    const { error } = await supabase.storage
      .from("restaurant-assets")
      .upload(path, file, { upsert: true });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from("restaurant-assets").getPublicUrl(path);
    return data.publicUrl;
  }

  const saveProfile = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!restaurantId) {
        throw new Error("No hay restaurante cargado.");
      }

      const logoFile = formData.get("logo") as File | null;
      const bannerFile = formData.get("banner") as File | null;
      const logoUrl =
        logoFile && logoFile.size > 0
          ? await uploadAsset(logoFile, "logos")
          : dashboardData.profile?.logo_url;
      const bannerUrl =
        bannerFile && bannerFile.size > 0
          ? await uploadAsset(bannerFile, "banners")
          : dashboardData.profile?.image_url;

      const name = String(formData.get("name") ?? "").trim();
      const payload = {
        name,
        description: String(formData.get("description") ?? "").trim() || null,
        phone: String(formData.get("phone") ?? "").trim() || null,
        whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
        category: String(formData.get("category") ?? "").trim() || null,
        estimated_time: String(formData.get("estimated_time") ?? "").trim() || null,
        delivery_enabled: formData.get("delivery_enabled") === "on",
        pickup_enabled: formData.get("pickup_enabled") === "on",
        manual_is_open:
          formData.get("manual_is_open") === "auto"
            ? null
            : formData.get("manual_is_open") === "open",
        logo_url: logoUrl,
        image_url: bannerUrl,
        slug:
          dashboardData.profile?.slug ??
          `${slugify(name || "restaurante")}-${userId.slice(0, 6)}`
      };

      const { error } = await supabase
        .from("restaurant_profiles")
        .update(payload)
        .eq("id", restaurantId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      setToast("Información guardada.");
      await queryClient.invalidateQueries({ queryKey: ["restaurant-profile", userId] });
    }
  });

  const addHour = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!restaurantId) {
        throw new Error("No hay restaurante cargado.");
      }

      const { error } = await supabase.from("horarios_restaurantes").insert({
        restaurante: restaurantId,
        dia_semana: formData.get("dia_semana"),
        horario_apertura: formData.get("horario_apertura"),
        horario_cierre: formData.get("horario_cierre")
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      setToast("Horario agregado.");
      await queryClient.invalidateQueries({ queryKey: ["restaurant-hours", restaurantId] });
    }
  });

  const deleteHour = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("horarios_restaurantes").delete().eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      setToast("Horario eliminado.");
      await queryClient.invalidateQueries({ queryKey: ["restaurant-hours", restaurantId] });
    }
  });

  const saveCategory = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!restaurantId) {
        throw new Error("No hay restaurante cargado.");
      }

      const id = String(formData.get("id") ?? "");
      const payload = {
        restaurant_id: restaurantId,
        name: String(formData.get("name") ?? "").trim(),
        sort_order: Number(formData.get("sort_order") ?? 0)
      };
      const query = id
        ? supabase.from("menu_categories").update(payload).eq("id", id)
        : supabase.from("menu_categories").insert(payload);
      const { error } = await query;

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      setToast("Categoría guardada.");
      await queryClient.invalidateQueries({
        queryKey: ["restaurant-categories", restaurantId]
      });
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_categories").delete().eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      setToast("Categoría eliminada.");
      await queryClient.invalidateQueries({
        queryKey: ["restaurant-categories", restaurantId]
      });
    }
  });

  const saveProduct = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!restaurantId) {
        throw new Error("No hay restaurante cargado.");
      }

      const id = String(formData.get("id") ?? "");
      const imageFile = formData.get("image") as File | null;
      const currentProduct = dashboardData.products.find((product) => product.id === id);
      const imageUrl =
        imageFile && imageFile.size > 0
          ? await uploadAsset(imageFile, "products")
          : currentProduct?.image_url;
      const categoryId = String(formData.get("category_id") ?? "");
      const payload = {
        restaurant_id: restaurantId,
        category_id: categoryId || null,
        name: String(formData.get("name") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim() || null,
        price: moneyToCents(String(formData.get("price") ?? "0")),
        image_url: imageUrl ?? null,
        is_available: formData.get("is_available") === "on",
        is_featured: formData.get("is_featured") === "on"
      };
      const query = id
        ? supabase.from("menu_items").update(payload).eq("id", id)
        : supabase.from("menu_items").insert(payload);
      const { error } = await query;

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      setToast("Producto guardado.");
      await queryClient.invalidateQueries({ queryKey: ["restaurant-products", restaurantId] });
    }
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      setToast("Producto eliminado.");
      await queryClient.invalidateQueries({ queryKey: ["restaurant-products", restaurantId] });
    }
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/restaurante/login");
    router.refresh();
  }

  async function handlePasswordUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setToast(error.message);
      return;
    }

    setPassword("");
    setToast("Contraseña actualizada.");
  }

  if (profileQuery.isLoading) {
    return (
      <div className="mt-8 grid gap-4">
        <div className="h-40 animate-pulse rounded-[1.7rem] bg-neutral-100" />
        <div className="h-72 animate-pulse rounded-[1.7rem] bg-neutral-100" />
      </div>
    );
  }

  if (profileQuery.error) {
    return (
      <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
        No se pudo cargar el panel. Revisa la configuración de Supabase.
      </div>
    );
  }

  const profile = dashboardData.profile;

  return (
    <div className="pb-20">
      {toast && (
        <button
          type="button"
          onClick={() => setToast(null)}
          className="fixed bottom-5 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl bg-ink-950 px-4 py-3 text-sm font-bold text-white shadow-soft"
        >
          {toast}
        </button>
      )}

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-w-36 items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-black transition ${
                activeTab === tab.id
                  ? "border-brand-500 bg-brand-50 text-ink-950"
                  : "border-neutral-200 bg-white text-neutral-500"
              }`}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "info" && profile && (
        <form
          className="mt-5 grid gap-4 rounded-[1.7rem] border border-neutral-200 bg-white p-4 shadow-card"
          onSubmit={(event) => {
            event.preventDefault();
            saveProfile.mutate(new FormData(event.currentTarget));
          }}
        >
          <div>
            <h2 className="text-xl font-black text-ink-950">Información del comercio</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Estos datos se muestran en MenuYa y en el mensaje de WhatsApp.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <InputLabel>Nombre</InputLabel>
              <input name="name" defaultValue={profile.name} required className="mt-2 w-full rounded-2xl border border-neutral-200 px-3 py-3 outline-none focus:border-brand-600" />
            </div>
            <div>
              <InputLabel>Categoría principal</InputLabel>
              <input name="category" defaultValue={profile.category ?? ""} className="mt-2 w-full rounded-2xl border border-neutral-200 px-3 py-3 outline-none focus:border-brand-600" />
            </div>
            <div>
              <InputLabel>Teléfono</InputLabel>
              <input name="phone" defaultValue={profile.phone ?? ""} className="mt-2 w-full rounded-2xl border border-neutral-200 px-3 py-3 outline-none focus:border-brand-600" />
            </div>
            <div>
              <InputLabel>WhatsApp</InputLabel>
              <input name="whatsapp" defaultValue={profile.whatsapp ?? ""} className="mt-2 w-full rounded-2xl border border-neutral-200 px-3 py-3 outline-none focus:border-brand-600" />
            </div>
            <div>
              <InputLabel>Tiempo estimado</InputLabel>
              <input name="estimated_time" defaultValue={profile.estimated_time ?? ""} placeholder="Ej: 30-45 min" className="mt-2 w-full rounded-2xl border border-neutral-200 px-3 py-3 outline-none focus:border-brand-600" />
            </div>
            <div>
              <InputLabel>Estado manual</InputLabel>
              <select name="manual_is_open" defaultValue={profile.manual_is_open === null ? "auto" : profile.manual_is_open ? "open" : "closed"} className="mt-2 w-full rounded-2xl border border-neutral-200 px-3 py-3 outline-none focus:border-brand-600">
                <option value="auto">Automático por horarios</option>
                <option value="open">Forzar abierto</option>
                <option value="closed">Forzar cerrado</option>
              </select>
            </div>
          </div>

          <div>
            <InputLabel>Descripción</InputLabel>
            <textarea name="description" defaultValue={profile.description ?? ""} rows={4} className="mt-2 w-full rounded-2xl border border-neutral-200 px-3 py-3 outline-none focus:border-brand-600" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 p-3">
              <InputLabel>Logo</InputLabel>
              <ImageUploadField
                name="logo"
                currentUrl={profile.logo_url}
                alt="Logo actual"
                variant="logo"
              />
            </div>
            <div className="rounded-2xl border border-neutral-200 p-3">
              <InputLabel>Banner</InputLabel>
              <ImageUploadField
                name="banner"
                currentUrl={profile.image_url}
                alt="Banner actual"
                variant="banner"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-2xl bg-neutral-50 px-3 py-3 text-sm font-bold">
              <input name="delivery_enabled" type="checkbox" defaultChecked={profile.delivery_enabled} />
              Delivery habilitado
            </label>
            <label className="flex items-center gap-2 rounded-2xl bg-neutral-50 px-3 py-3 text-sm font-bold">
              <input name="pickup_enabled" type="checkbox" defaultChecked={profile.pickup_enabled} />
              Retiro habilitado
            </label>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink-950 px-5 py-4 font-bold text-white">
            <Save size={18} />
            Guardar información
          </button>
        </form>
      )}

      {activeTab === "hours" && (
        <section className="mt-5 grid gap-4">
          <form
            className="rounded-[1.7rem] border border-neutral-200 bg-white p-4 shadow-card"
            onSubmit={(event) => {
              event.preventDefault();
              addHour.mutate(new FormData(event.currentTarget));
              event.currentTarget.reset();
            }}
          >
            <h2 className="text-xl font-black text-ink-950">Horarios</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <select name="dia_semana" className="rounded-2xl border border-neutral-200 px-3 py-3">
                {days.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <input name="horario_apertura" type="time" required className="rounded-2xl border border-neutral-200 px-3 py-3" />
              <input name="horario_cierre" type="time" required className="rounded-2xl border border-neutral-200 px-3 py-3" />
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink-950 px-4 py-3 font-bold text-white">
                <Plus size={17} />
                Agregar
              </button>
            </div>
          </form>

          <div className="grid gap-2">
            {dashboardData.hours.map((hour) => (
              <div key={hour.id} className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                <span className="font-bold capitalize">{hour.dia_semana}</span>
                <span className="text-sm font-semibold text-neutral-500">
                  {hour.horario_apertura.slice(0, 5)} a {hour.horario_cierre.slice(0, 5)}
                </span>
                <button onClick={() => deleteHour.mutate(hour.id)} className="rounded-xl bg-neutral-100 p-2 text-neutral-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "categories" && (
        <section className="mt-5 grid gap-4">
          <form
            className="rounded-[1.7rem] border border-neutral-200 bg-white p-4 shadow-card"
            onSubmit={(event) => {
              event.preventDefault();
              saveCategory.mutate(new FormData(event.currentTarget));
              event.currentTarget.reset();
            }}
          >
            <h2 className="text-xl font-black text-ink-950">Categorías</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_120px_140px]">
              <input name="name" required placeholder="Ej: Pizzas" className="rounded-2xl border border-neutral-200 px-3 py-3" />
              <input name="sort_order" type="number" defaultValue={0} className="rounded-2xl border border-neutral-200 px-3 py-3" />
              <button className="rounded-2xl bg-ink-950 px-4 py-3 font-bold text-white">Guardar</button>
            </div>
          </form>
          {dashboardData.categories.map((category) => (
            <form
              key={category.id}
              className="grid gap-2 rounded-2xl border border-neutral-200 bg-white p-3 sm:grid-cols-[1fr_100px_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                saveCategory.mutate(new FormData(event.currentTarget));
              }}
            >
              <input type="hidden" name="id" value={category.id} />
              <input name="name" defaultValue={category.name} className="rounded-xl bg-neutral-50 px-3 py-2 font-bold" />
              <input name="sort_order" type="number" defaultValue={category.sort_order} className="rounded-xl bg-neutral-50 px-3 py-2" />
              <div className="flex gap-2">
                <button className="rounded-xl bg-brand-50 px-3 py-2 font-bold text-brand-700">Editar</button>
                <button type="button" onClick={() => deleteCategory.mutate(category.id)} className="rounded-xl bg-neutral-100 px-3 py-2"><Trash2 size={16} /></button>
              </div>
            </form>
          ))}
        </section>
      )}

      {activeTab === "products" && (
        <section className="mt-5 grid gap-4">
          <ProductForm categories={dashboardData.categories} onSubmit={(formData) => saveProduct.mutate(formData)} />
          {dashboardData.products.map((product) => (
            <ProductForm
              key={product.id}
              product={product}
              categories={dashboardData.categories}
              onSubmit={(formData) => saveProduct.mutate(formData)}
              onDelete={() => deleteProduct.mutate(product.id)}
            />
          ))}
        </section>
      )}

      {activeTab === "account" && (
        <section className="mt-5 grid gap-4 rounded-[1.7rem] border border-neutral-200 bg-white p-4 shadow-card">
          <div>
            <h2 className="text-xl font-black text-ink-950">Cuenta</h2>
            <p className="mt-1 text-sm text-neutral-500">{email}</p>
          </div>
          <form className="grid gap-3" onSubmit={handlePasswordUpdate}>
            <InputLabel>Cambiar contraseña</InputLabel>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={6} required className="rounded-2xl border border-neutral-200 px-3 py-3" placeholder="Nueva contraseña" />
            <button className="rounded-2xl bg-ink-950 px-4 py-3 font-bold text-white">Actualizar contraseña</button>
          </form>
          <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 px-4 py-3 font-bold text-ink-950">
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </section>
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onSubmit,
  onDelete
}: {
  product?: MenuItem;
  categories: MenuCategory[];
  onSubmit: (formData: FormData) => void;
  onDelete?: () => void;
}) {
  return (
    <form
      className="rounded-[1.7rem] border border-neutral-200 bg-white p-4 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
        if (!product) {
          event.currentTarget.reset();
        }
      }}
    >
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-ink-950">
          {product ? product.name : "Nuevo producto"}
        </h2>
        {onDelete && (
          <button type="button" onClick={onDelete} className="rounded-xl bg-neutral-100 p-2">
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input name="name" defaultValue={product?.name ?? ""} required placeholder="Nombre" className="rounded-2xl border border-neutral-200 px-3 py-3" />
        <input name="price" type="number" defaultValue={product?.price ?? ""} required placeholder="Precio" className="rounded-2xl border border-neutral-200 px-3 py-3" />
        <select name="category_id" defaultValue={product?.category_id ?? ""} className="rounded-2xl border border-neutral-200 px-3 py-3">
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <ImageUploadField
          name="image"
          currentUrl={product?.image_url}
          alt={product?.name ?? "Imagen de producto"}
          variant="product"
        />
      </div>
      <textarea name="description" defaultValue={product?.description ?? ""} placeholder="Descripción breve" rows={3} className="mt-3 w-full rounded-2xl border border-neutral-200 px-3 py-3" />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-2xl bg-neutral-50 px-3 py-3 text-sm font-bold">
          <input name="is_available" type="checkbox" defaultChecked={product?.is_available ?? true} />
          Disponible
        </label>
        <label className="flex items-center gap-2 rounded-2xl bg-neutral-50 px-3 py-3 text-sm font-bold">
          <input name="is_featured" type="checkbox" defaultChecked={product?.is_featured ?? false} />
          Destacado
        </label>
      </div>
      <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink-950 px-4 py-3 font-bold text-white">
        {product ? <CheckCircle2 size={18} /> : <PackagePlus size={18} />}
        {product ? "Guardar producto" : "Crear producto"}
      </button>
    </form>
  );
}

function ImageUploadField({
  name,
  currentUrl,
  alt,
  variant
}: {
  name: string;
  currentUrl?: string | null;
  alt: string;
  variant: "logo" | "banner" | "product";
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const isLogo = variant === "logo";

  return (
    <div className={variant === "product" ? "md:col-span-2" : ""}>
      {previewUrl ? (
        <Image
          src={previewUrl}
          alt={alt}
          width={isLogo ? 96 : 420}
          height={isLogo ? 96 : 180}
          className={`mt-3 object-cover ${
            isLogo ? "h-24 w-24 rounded-2xl" : "h-32 w-full rounded-2xl"
          }`}
        />
      ) : (
        <div
          className={`mt-3 grid place-items-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 text-sm font-bold text-neutral-400 ${
            isLogo ? "h-24 w-24" : "h-32 w-full"
          }`}
        >
          Sin imagen
        </div>
      )}
      <input
        name={name}
        type="file"
        accept="image/*"
        className="mt-3 text-sm"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            setPreviewUrl(URL.createObjectURL(file));
          }
        }}
      />
    </div>
  );
}
