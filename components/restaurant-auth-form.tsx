"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, Store, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";

type AuthMode = "login" | "register" | "recover";

export function RestaurantAuthForm() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function ensureRestaurantProfile(userId: string) {
    const cleanName = restaurantName.trim() || email.split("@")[0] || "Mi restaurante";
    const { data: city } = await supabase
      .from("cities")
      .select("id")
      .eq("slug", "suipacha")
      .single();

    if (!city?.id) {
      throw new Error("No se encontró la ciudad inicial.");
    }

    await supabase.from("restaurant_profiles").upsert(
      {
        owner_user_id: userId,
        name: cleanName,
        slug: `${slugify(cleanName)}-${userId.slice(0, 6)}`,
        category: "Comida local",
        city_id: city?.id
      },
      { onConflict: "owner_user_id" }
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "recover") {
        const { error: recoverError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/auth/callback?next=/restaurante/panel`
          }
        );

        if (recoverError) {
          throw recoverError;
        }

        setMessage("Te enviamos un enlace para recuperar tu contraseña.");
        return;
      }

      if (mode === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              restaurant_name: restaurantName.trim()
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/restaurante/panel`
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.user && data.session) {
          await ensureRestaurantProfile(data.user.id);
          router.push("/restaurante/panel");
          router.refresh();
          return;
        }

        setMessage("Registro creado. Revisa tu email para confirmar la cuenta.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw signInError;
      }

      router.push("/restaurante/panel");
      router.refresh();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudo completar la operación."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="animate-soft-in rounded-[1.7rem] border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        {mode === "register" ? <UserPlus size={22} /> : <Store size={22} />}
      </div>
      <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
        {mode === "register"
          ? "Registrar restaurante"
          : mode === "recover"
            ? "Recuperar contraseña"
            : "Acceso para restaurantes"}
      </h1>
      <p className="mt-2 text-slate-600">
        {mode === "recover"
          ? "Ingresa tu email y te enviaremos un enlace seguro."
          : "Administra tu comercio y tu menú desde un panel simple."}
      </p>

      <div className="mt-5 grid grid-cols-3 rounded-2xl bg-neutral-100 p-1 text-sm font-black">
        {[
          ["login", "Login"],
          ["register", "Registro"],
          ["recover", "Clave"]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value as AuthMode);
              setError(null);
              setMessage(null);
            }}
            className={`rounded-xl px-3 py-2 transition ${
              mode === value ? "bg-white text-ink-950 shadow-sm" : "text-neutral-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {mode === "register" && (
          <div>
            <label className="text-sm font-bold text-slate-700">
              Nombre del restaurante
            </label>
            <input
              value={restaurantName}
              onChange={(event) => setRestaurantName(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none transition focus:border-brand-600"
              placeholder="Ej: La Esquina"
            />
          </div>
        )}
        <div>
          <label className="text-sm font-bold text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none transition focus:border-brand-600"
            placeholder="restaurante@email.com"
          />
        </div>
        {mode !== "recover" && (
          <div>
            <label className="text-sm font-bold text-slate-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none transition focus:border-brand-600"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-red-50 px-3 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-2xl bg-brand-50 px-3 py-3 text-sm font-semibold text-brand-700">
            {message}
          </div>
        )}

        <button
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 font-bold text-white shadow-soft transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mode === "recover" ? <Mail size={18} /> : <LockKeyhole size={18} />}
          {isSubmitting
            ? "Procesando..."
            : mode === "register"
              ? "Crear cuenta"
              : mode === "recover"
                ? "Enviar enlace"
                : "Ingresar"}
        </button>
      </form>
    </section>
  );
}
