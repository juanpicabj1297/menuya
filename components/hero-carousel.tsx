"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const heroImages = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroImages.length);
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
      {heroImages.map((image, index) => (
        <Image
          key={image}
          src={image}
          alt=""
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 1152px, 100vw"
          className={`object-cover blur-[0.5px] saturate-[1.08] transition duration-[1800ms] ease-out ${
            activeIndex === index ? "scale-100 opacity-75" : "scale-105 opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-white/58" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(163,230,53,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0.78)_48%,#ffffff_96%)]" />
    </div>
  );
}
