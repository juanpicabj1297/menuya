import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/cart-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MenuYa",
  description: "Pedidos online para restaurantes locales de Suipacha.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#ff5a5f",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
