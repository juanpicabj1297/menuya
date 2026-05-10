"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 py-8">
      <section className="rounded-[1.7rem] border border-white bg-white p-5 shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
          MenuYa
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          No pudimos cargar la informacion.
        </h1>
        <p className="mt-2 text-sm text-slate-600">{error.message}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center font-bold text-slate-700"
          >
            Ir al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
