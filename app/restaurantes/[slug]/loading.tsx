export default function RestaurantMenuLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-28 pt-4 sm:px-6">
      <div className="h-16 animate-pulse rounded-2xl bg-white shadow-card" />
      <div className="mt-5 h-72 animate-pulse rounded-[1.7rem] bg-white shadow-card" />
      <div className="mt-5 flex gap-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-9 w-28 animate-pulse rounded-full bg-white shadow-sm"
          />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-2xl bg-white shadow-card"
          />
        ))}
      </div>
    </main>
  );
}
