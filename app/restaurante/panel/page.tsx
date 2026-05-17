import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { RestaurantPanelClient } from "@/components/restaurant-panel-client";
import { createClient } from "@/lib/supabase/server";

export default async function RestaurantPanelPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/restaurante/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-4 sm:px-6">
      <nav className="sticky top-3 z-20 mb-6 flex items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-3 py-3 shadow-card backdrop-blur">
        <BrandLogo />
        <span className="rounded-full bg-brand-50 px-3 py-2 text-xs font-black text-brand-700">
          Panel privado
        </span>
      </nav>

      <header className="animate-soft-in mb-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
            Panel del restaurante
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Mi comercio
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-500">
            Administra tu información, horarios, categorías y productos desde
            un solo lugar.
          </p>
        </div>
      </header>

      <RestaurantPanelClient userId={user.id} email={user.email ?? ""} />
    </main>
  );
}
