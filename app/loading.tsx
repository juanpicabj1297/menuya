export default function Loading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-4 sm:px-6">
      <div className="h-16 animate-pulse rounded-2xl bg-white shadow-card" />
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <div className="h-8 w-56 animate-pulse rounded-full bg-white shadow-sm" />
          <div className="mt-6 h-32 animate-pulse rounded-3xl bg-white shadow-card" />
          <div className="mt-5 h-20 animate-pulse rounded-3xl bg-white shadow-card" />
        </div>
        <div className="h-96 animate-pulse rounded-[2rem] bg-white shadow-soft" />
      </div>
    </main>
  );
}
