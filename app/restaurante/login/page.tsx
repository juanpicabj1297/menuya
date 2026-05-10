import Link from "next/link";
import { ArrowLeft, LockKeyhole, Store } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function RestaurantLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <BrandLogo />
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm"
        >
          <ArrowLeft size={17} />
          Inicio
        </Link>
      </div>

      <section className="animate-soft-in rounded-[1.7rem] border border-white bg-white p-5 shadow-soft">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Store size={22} />
        </div>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
          Acceso para restaurantes
        </h1>
        <p className="mt-2 text-slate-600">
          Administra tu menu y revisa pedidos recibidos desde un panel simple.
        </p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700">Email</label>
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none transition focus:border-brand-600"
              placeholder="restaurante@email.com"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700">
              Contrasena
            </label>
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none transition focus:border-brand-600"
              placeholder="********"
            />
          </div>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 font-bold text-white shadow-soft transition hover:bg-slate-800">
            <LockKeyhole size={18} />
            Ingresar
          </button>
        </form>
      </section>
    </main>
  );
}
