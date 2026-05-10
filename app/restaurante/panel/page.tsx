import { ClipboardList, Clock3, Plus, Store, TrendingUp } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function RestaurantPanelPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-4 sm:px-6">
      <nav className="sticky top-3 z-20 mb-6 flex items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-3 py-3 shadow-card backdrop-blur">
        <BrandLogo />
        <span className="rounded-full bg-mint-50 px-3 py-2 text-xs font-black text-mint-700">
          Online
        </span>
      </nav>

      <header className="animate-soft-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
            Panel del restaurante
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Mi comercio
          </h1>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 font-bold text-white shadow-soft transition hover:bg-brand-700">
          <Plus size={18} />
          Agregar plato
        </button>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white bg-white p-4 shadow-card">
          <Store className="text-brand-700" size={22} />
          <h2 className="mt-3 font-black text-slate-950">Estado</h2>
          <p className="mt-1 text-sm text-slate-500">Abierto para pedidos</p>
        </div>
        <div className="rounded-2xl border border-white bg-white p-4 shadow-card">
          <ClipboardList className="text-brand-700" size={22} />
          <h2 className="mt-3 font-black text-slate-950">Pedidos hoy</h2>
          <p className="mt-1 text-2xl font-bold text-slate-950">8</p>
        </div>
        <div className="rounded-2xl border border-white bg-white p-4 shadow-card">
          <Clock3 className="text-brand-700" size={22} />
          <h2 className="mt-3 font-black text-slate-950">Tiempo estimado</h2>
          <p className="mt-1 text-sm text-slate-500">30 a 45 minutos</p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-white bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-slate-950">Menu</h2>
            <TrendingUp size={18} className="text-mint-700" />
          </div>
          <div className="mt-4 space-y-3">
            {["Pizza muzzarella", "Hamburguesa completa", "Empanadas"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3"
                >
                  <span className="font-bold">{item}</span>
                  <button className="text-sm font-bold text-brand-700">
                    Editar
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white bg-white p-4 shadow-card">
          <h2 className="font-black text-slate-950">Pedidos recientes</h2>
          <div className="mt-4 space-y-3">
            {["Pedido #1042", "Pedido #1041", "Pedido #1040"].map((order) => (
              <div key={order} className="rounded-2xl bg-slate-50 p-3">
                <div className="font-bold text-slate-950">{order}</div>
                <div className="mt-1 text-sm text-slate-500">
                  Pendiente de confirmacion
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
