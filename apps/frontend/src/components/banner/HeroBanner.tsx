"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "@/lib/api";

const FALLBACK_IMAGE =
  "https://storage.vitrine-cg.inovautomatica.com/produtos/site/capa-hero.jpg";

interface Props {
  banners: Banner[];
}

export default function HeroBanner({ banners }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const activeBanner = banners[current] ?? null;

  if (banners.length === 0) {
    return (
      <section
        className="relative text-white py-12 md:py-20 px-4"
        style={{
          backgroundImage: `url(${FALLBACK_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-shopping-dark/70 via-shopping-medium/60 to-shopping-light/50" />
        <HeroContent linkUrl={null} />
      </section>
    );
  }

  return (
    <section
      className="relative text-white overflow-hidden"
      style={{ minHeight: "clamp(280px, 50vw, 420px)" }}
    >
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={banner.image_url}
            alt={banner.title ?? "Banner Vitrine CG"}
            fill
            unoptimized
            loading={index === 0 ? "eager" : "lazy"}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-shopping-dark/75 via-shopping-medium/60 to-transparent" />

      {/* Conteúdo */}
      <div className="relative z-10 py-12 md:py-20 px-4">
        <HeroContent linkUrl={activeBanner?.link_url ?? null} />
      </div>

      {/* Indicadores */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`rounded-full transition-all duration-300 ${
                index === current
                  ? "w-5 h-2 bg-orange-500"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HeroContent({ linkUrl }: { linkUrl: string | null }) {
  return (
    <div className="max-w-7xl mx-auto text-center">
      <span className="badge bg-white/10 text-orange-300 border border-orange-500/30 mb-3 text-xs md:text-sm px-3 py-1.5">
        🛍️ Shopping Popular de Campina Grande
      </span>
      <h1 className="text-2xl sm:text-4xl md:text-6xl font-black mt-3 mb-4 leading-tight">
        Tudo que você precisa
        <span className="text-orange-400"> em um só lugar</span>
      </h1>
      <p className="text-white/70 text-sm md:text-xl max-w-2xl mx-auto mb-6 hidden sm:block">
        Compre direto com os lojistas do shopping popular. Preços imbatíveis e
        atendimento personalizado via WhatsApp.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/lojas"
          className="btn-primary text-sm md:text-lg px-6 py-3 md:py-4"
        >
          Ver todas as lojas →
        </Link>
        <Link
          href="#lojas"
          className="border border-white/30 hover:border-white/60 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 inline-block text-sm md:text-base"
        >
          Explorar agora
        </Link>
        {linkUrl && (
          <Link
            href={linkUrl}
            target={linkUrl.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 inline-block text-sm md:text-base"
          >
            Ver oferta →
          </Link>
        )}
      </div>
    </div>
  );
}
