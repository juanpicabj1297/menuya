import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { RestaurantAuthForm } from "@/components/restaurant-auth-form";
import { createClient } from "@/lib/supabase/server";

export default async function RestaurantLoginPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/restaurante/panel");
  }

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

      <RestaurantAuthForm />
    </main>
  );
}
