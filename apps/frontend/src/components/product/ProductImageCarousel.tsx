"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  productName: string;
}

export default function ProductImageCarousel({ images, productName }: Props) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className="relative bg-gray-100 flex flex-col items-center justify-center"
        style={{ minHeight: "400px" }}
      >
        <span className="text-6xl text-gray-200 mb-2">📦</span>
        <span className="text-sm text-gray-400">Sem foto</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="relative bg-gray-100" style={{ minHeight: "400px" }}>
        <Image
          src={images[0]}
          alt={productName}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className="flex rounded-2xl overflow-hidden"
      style={{ minHeight: "400px" }}
    >
      {/* ── Thumbnails verticais — esquerda (desktop) ─────────────────────── */}
      <div className="hidden md:flex flex-col gap-2 p-3 w-20 flex-shrink-0">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
              index === current
                ? "border-orange-500 shadow-md opacity-100"
                : "border-transparent opacity-50 hover:opacity-80 hover:border-gray-300"
            }`}
          >
            <Image
              src={img}
              alt={`${productName} miniatura ${index + 1}`}
              fill
              unoptimized
              sizes="56px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* ── Imagem principal ──────────────────────────────────────────────── */}
      <div className="relative flex-1 bg-gray-100 rounded-r-2xl overflow-hidden">
        <Image
          src={images[current]}
          alt={`${productName} — foto ${current + 1}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover transition-opacity duration-200"
          priority={current === 0}
        />

        {/* Setas — mobile */}
        <button
          onClick={() =>
            setCurrent((prev) => (prev - 1 + images.length) % images.length)
          }
          className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-md text-gray-700 font-bold text-lg"
        >
          ‹
        </button>
        <button
          onClick={() => setCurrent((prev) => (prev + 1) % images.length)}
          className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-md text-gray-700 font-bold text-lg"
        >
          ›
        </button>

        {/* Contador — mobile */}
        <div className="md:hidden absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {current + 1}/{images.length}
        </div>
      </div>
    </div>
  );
}
