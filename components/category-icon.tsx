import {
  Beef,
  CakeSlice,
  Croissant,
  CupSoda,
  Pizza,
  Sandwich,
  Soup,
  Utensils
} from "lucide-react";
import type { ReactNode } from "react";

type CategoryIconProps = {
  iconName: string;
  className?: string;
};

function BurgerIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 11.2c.55-4 3.8-6.2 8-6.2s7.45 2.2 8 6.2" />
      <path d="M5 11.2h14" />
      <path d="M5.5 14h13" />
      <path d="M6 17.5h12" />
      <path d="M7 14c.7 1 1.4 1 2.1 0s1.4-1 2.1 0 1.4 1 2.1 0 1.4-1 2.1 0 1.4 1 2.1 0" />
      <path d="M8.4 8.2h.01" />
      <path d="M12 7.6h.01" />
      <path d="M15.6 8.2h.01" />
    </svg>
  );
}

function EmpanadaIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.3 16.2c.75-5.4 4.8-9.5 8.7-9.5s7.95 4.1 8.7 9.5" />
      <path d="M3.3 16.2c3.7 1.55 13.7 1.55 17.4 0" />
      <path d="M5.2 14.3c.3-.9.95-1.15 1.7-.65.75.5 1.35.3 1.8-.55.45-.85 1.2-1.05 1.9-.4.7.65 1.45.65 2.1 0 .65-.65 1.45-.45 1.9.4.45.85 1.05 1.05 1.8.55.75-.5 1.4-.25 1.7.65" />
      <path d="M10.1 13.7c.25.65.62 1.1 1.1 1.35" />
      <path d="M12 13.4v1.75" />
      <path d="M13.9 13.7c-.25.65-.62 1.1-1.1 1.35" />
    </svg>
  );
}

function SushiIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4.3 13.3c.65-3.9 3.85-6.6 7.7-6.6 4 0 7.1 2.7 7.7 6.6" />
      <path d="M4.3 13.3c1.6 2 13.8 2 15.4 0" />
      <path d="M6.2 13.8c.2 2.25 1.8 3.5 5.8 3.5s5.6-1.25 5.8-3.5" />
      <path d="M19 12.4l2.1.45-1.7 1.05 1.05 2.2-2.15-1.25" />
      <path d="M8.7 9.3l.75 1.7" />
      <path d="M12 8.7l.75 1.9" />
      <path d="M15.3 9.3l.75 1.7" />
    </svg>
  );
}

export function CategoryIcon({ iconName, className = "h-5 w-5" }: CategoryIconProps) {
  const normalizedIcon = iconName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const icons: Record<string, ReactNode> = {
    pizza: <Pizza className={className} />,
    pizzas: <Pizza className={className} />,
    burger: <BurgerIcon className={className} />,
    hamburguesa: <BurgerIcon className={className} />,
    hamburguesas: <BurgerIcon className={className} />,
    empanada: <EmpanadaIcon className={className} />,
    empanadas: <EmpanadaIcon className={className} />,
    pasta: <Soup className={className} />,
    pastas: <Soup className={className} />,
    spaghetti: <Soup className={className} />,
    bowl: <Soup className={className} />,
    drink: <CupSoda className={className} />,
    bebida: <CupSoda className={className} />,
    bebidas: <CupSoda className={className} />,
    dessert: <CakeSlice className={className} />,
    postre: <CakeSlice className={className} />,
    postres: <CakeSlice className={className} />,
    sushi: <SushiIcon className={className} />,
    carne: <Beef className={className} />,
    carnes: <Beef className={className} />,
    asado: <Beef className={className} />,
    sandwich: <Sandwich className={className} />,
    sandwiches: <Sandwich className={className} />,
    sanguche: <Sandwich className={className} />,
    sanguches: <Sandwich className={className} />,
    pan: <Croissant className={className} />,
    panaderia: <Croissant className={className} />,
    bakery: <Croissant className={className} />
  };

  return icons[normalizedIcon] ?? <Utensils className={className} />;
}
