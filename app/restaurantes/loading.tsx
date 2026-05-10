export default function RestaurantsLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-4 sm:px-6">
      <div className="h-16 animate-pulse rounded-2xl bg-white shadow-card" />
      <div className="mt-6 h-28 animate-pulse rounded-3xl bg-white shadow-card" />
      <div className="mt-5 h-16 animate-pulse rounded-2xl bg-white shadow-card" />
      <section className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-80 animate-pulse rounded-[1.4rem] bg-white shadow-card"
          />
        ))}
      </section>
    </main>
  );
}
