"use client";

import Image from "next/image";
import Link from "next/link";
import { MouseEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Store,
  Trash2
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { DiscountBadge } from "@/components/discount-badge";
import { useCart } from "@/components/cart-provider";
import { QuantityControl } from "@/components/quantity-control";

type FulfillmentType = "delivery" | "pickup";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeWhatsappPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function formatPrice(value: number) {
  return `$${value.toLocaleString("es-AR")}`;
}

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    increment,
    decrement,
    removeItem,
    clearCart
  } = useCart();
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>("delivery");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const restaurant = items[0]
    ? {
        id: items[0].restaurantId,
        name: items[0].restaurantName,
        slug: items[0].restaurantSlug,
        phone: items[0].restaurantPhone ?? ""
      }
    : null;
  const restaurantPhone = normalizeWhatsappPhone(restaurant?.phone ?? "");

  const whatsappMessage = useMemo(() => {
    const productLines = items
      .map(
        (item) =>
          `- ${item.quantity} x ${item.name} (${formatPrice(
            item.quantity * item.price
          )})`
      )
      .join("\n");

    return [
      `Hola ${restaurant?.name ?? ""}, quiero hacer este pedido por MenuYa:`,
      "",
      productLines,
      "",
      `Subtotal: ${formatPrice(totalPrice)}`,
      "",
      `Nombre: ${customerName}`,
      `Telefono: ${customerPhone}`,
      `Entrega: ${
        fulfillmentType === "delivery" ? "Delivery del local" : "Retiro en local"
      }`,
      fulfillmentType === "delivery" ? `Direccion: ${address}` : null,
      `Pago: ${paymentMethod}`,
      notes.trim() ? `Observaciones: ${notes.trim()}` : null
    ]
      .filter(Boolean)
      .join("\n");
  }, [
    address,
    customerName,
    customerPhone,
    fulfillmentType,
    items,
    notes,
    paymentMethod,
    restaurant?.name,
    totalPrice
  ]);

  const whatsappHref = restaurantPhone
    ? `https://wa.me/${restaurantPhone}?text=${encodeURIComponent(
        whatsappMessage
      )}`
    : "";

  function getValidationError() {
    if (!restaurant || items.length === 0) {
      return "Agrega al menos un producto para confirmar el pedido.";
    }

    if (!restaurantPhone) {
      return "Este restaurante no tiene numero de WhatsApp cargado.";
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      return "Completa tu nombre y telefono para que el local pueda responder.";
    }

    if (fulfillmentType === "delivery" && !address.trim()) {
      return "Completa la direccion para el delivery del local.";
    }

    return "";
  }

  async function saveOrder() {
    if (!restaurant || !uuidPattern.test(restaurant.id)) {
      return;
    }

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id: restaurant.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: fulfillmentType === "delivery" ? address : null,
        notes: notes.trim() || null,
        fulfillment_type: fulfillmentType,
        payment_method: paymentMethod,
        total: totalPrice
      })
      .select("id")
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        menu_item_id: uuidPattern.test(item.id) ? item.id : null,
        item_name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        notes: null
      }))
    );

    if (itemsError) {
      throw new Error(itemsError.message);
    }
  }

  async function handleWhatsappClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setError("");

    const validationError = getValidationError();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await saveOrder();
    } catch {
      // El pedido igualmente puede enviarse por WhatsApp si Supabase falla.
    } finally {
      clearCart();
      window.location.assign(whatsappHref);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-4 sm:px-6">
      <nav className="sticky top-3 z-20 mb-6 flex items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-3 py-3 shadow-card backdrop-blur">
        <BrandLogo compact />
        <Link
          href={restaurant ? `/restaurantes/${restaurant.slug}` : "/restaurantes"}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"
        >
          <ArrowLeft size={17} />
          Seguir
        </Link>
      </nav>

      <header className="animate-soft-in">
        <h1 className="text-4xl font-black tracking-tight text-slate-950">
          Confirmar pedido
        </h1>
        <p className="mt-2 text-slate-600">
          {totalItems > 0
            ? `${totalItems} producto${totalItems === 1 ? "" : "s"} para ${
                restaurant?.name
              }.`
            : "Agrega productos desde el menu del restaurante."}
        </p>
      </header>

      <form className="mt-6 space-y-4">
        <section className="rounded-2xl border border-white bg-white p-4 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-950">Resumen</h2>
              <p className="mt-1 text-sm text-slate-500">
                Revisa cantidades antes de enviar.
              </p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
              {totalItems} item{totalItems === 1 ? "" : "s"}
            </span>
          </div>

          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <h3 className="font-black text-slate-950">
                Tu carrito esta vacio
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Elegi un restaurante y suma productos con el control de cantidad.
              </p>
              <Link
                href="/restaurantes"
                className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white"
              >
                Ver restaurantes
              </Link>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex gap-3">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={76}
                    height={76}
                    className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-slate-950">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          {item.restaurantName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatPrice(item.price)} c/u
                        </p>
                        {item.discountPercent && item.originalPrice && (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 line-through">
                              {formatPrice(item.originalPrice)}
                            </span>
                            <DiscountBadge percent={item.discountPercent} compact />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-brand-100 hover:bg-brand-50 hover:text-brand-700"
                        aria-label="Quitar producto"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <QuantityControl
                        compact
                        quantity={item.quantity}
                        onIncrement={() => increment(item)}
                        onDecrement={() => decrement(item.id)}
                      />
                      <strong className="text-right text-slate-950">
                        {formatPrice(item.quantity * item.price)}
                      </strong>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xl font-black">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white bg-white p-4 shadow-card">
          <h2 className="font-black text-slate-950">Entrega</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFulfillmentType("delivery")}
              className={`rounded-2xl border p-3 text-left transition ${
                fulfillmentType === "delivery"
                  ? "border-brand-100 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <MapPin size={18} />
              <span className="mt-2 block text-sm font-black">
                Delivery del local
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentType("pickup")}
              className={`rounded-2xl border p-3 text-left transition ${
                fulfillmentType === "pickup"
                  ? "border-brand-100 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <Store size={18} />
              <span className="mt-2 block text-sm font-black">
                Retiro en local
              </span>
            </button>
          </div>
          <div className="mt-4 rounded-2xl bg-brand-50 p-3 text-sm font-semibold text-brand-700">
            <ShieldCheck className="mr-2 inline" size={17} />
            MenuYa no usa GPS. El local recibe los datos escritos.
          </div>
        </section>

        <section className="rounded-2xl border border-white bg-white p-4 shadow-card">
          <h2 className="font-black text-slate-950">Tus datos</h2>
          <div className="mt-4 grid gap-3">
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-600"
              placeholder="Nombre"
            />
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-600"
              placeholder="Telefono"
            />
            {fulfillmentType === "delivery" && (
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-600"
                placeholder="Direccion"
              />
            )}
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-600"
              placeholder="Observaciones opcionales: sin cebolla, cambio justo, tocar timbre..."
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white bg-white p-4 shadow-card">
          <h2 className="flex items-center gap-2 font-black text-slate-950">
            <CreditCard size={18} />
            Metodo de pago
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {["Efectivo", "Transferencia", "Coordinar"].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                  paymentMethod === method
                    ? "border-brand-100 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-3 text-sm font-bold text-brand-700">
            {error}
          </div>
        )}

        <a
          href={whatsappHref || "#"}
          onClick={handleWhatsappClick}
          aria-disabled={items.length === 0 || isSubmitting || !restaurantPhone}
          className={`sticky bottom-4 z-10 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-black text-white shadow-soft transition ${
            items.length === 0 || isSubmitting || !restaurantPhone
              ? "cursor-not-allowed bg-slate-300 shadow-none"
              : "bg-brand-600 hover:bg-brand-700"
          }`}
        >
          <MessageCircle size={20} />
          {isSubmitting ? "Preparando pedido..." : "Confirmar por WhatsApp"}
        </a>
      </form>
    </main>
  );
}
