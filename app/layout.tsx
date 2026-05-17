import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "MenuYa",
  description: "Pedidos online para restaurantes locales de Suipacha.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#A3E635",
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
