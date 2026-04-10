"use client";

import Link from "next/link";
import Image from "next/image";
import { Store } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Props {
  store: Store;
  // Quando true, aplica borda e visual especial de destaque
  featured?: boolean;
}

export default function StoreCard({ store, featured = false }: Props) {
  const isPremium = store.plan === "premium";

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!store.whatsapp) return;
    fetch(`${API_URL}/public/stores/${store.id}/events/whatsapp`, { method: "POST" }).catch(() => {});
    window.open(
      `https://wa.me/55${store.whatsapp.replace(/\D/g, "")}?text=Olá! Vi sua loja no Vitrine CG e tenho interesse!`,
      "_blank",
    );
  };

  return (
    <Link href={`/lojas/${store.id}`}>
      <div
        className={`card cursor-pointer group relative ${
          isPremium ? "ring-2 ring-orange-400 shadow-orange-100 shadow-lg" : ""
        }`}
      >
        {/* Badge destaque — aparece no canto superior esquerdo */}
        {isPremium && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-400 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
              ⭐ Destaque
            </span>
          </div>
        )}

        {/* Capa */}
        <div className="relative h-36 bg-gradient-to-br from-blue-900 to-red-500 overflow-hidden">
          {store.cover_url ? (
            <Image
              src={store.cover_url}
              alt={store.name}
              fill
              unoptimized={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
              🏪
            </div>
          )}

          {/* Badge aberta/fechada — direita */}
          <div className="absolute top-3 right-3">
            <span
              className={`badge ${
                store.is_open
                  ? "bg-green-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {store.is_open ? "● Aberta" : "● Fechada"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Logo com sobreposição */}
            <div
              className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border-2 shadow-md -mt-8 relative z-10 ${
                isPremium ? "border-orange-400" : "border-white"
              }`}
            >
              {store.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  width={48}
                  height={48}
                  unoptimized={true}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white font-black text-lg">
                  {store.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 mt-1">
              <h3
                className={`font-bold truncate transition-colors ${
                  isPremium
                    ? "text-gray-900 group-hover:text-orange-600"
                    : "text-gray-900 group-hover:text-orange-600"
                }`}
              >
                {store.name}
              </h3>
              {store.segment && (
                <span className="badge bg-orange-100 text-orange-700 mt-1">
                  {store.segment}
                </span>
              )}
            </div>
          </div>

          {store.description && (
            <p className="text-gray-500 text-sm mt-3 line-clamp-2">
              {store.description}
            </p>
          )}

          {store.location && (
            <p className="text-gray-400 text-xs mt-2">📍 {store.location}</p>
          )}

          {store.whatsapp && (
            <button
              onClick={handleWhatsApp}
              className="mt-3 btn-whatsapp text-sm py-2 w-full justify-center"
            >
              <span>💬</span> Falar no WhatsApp
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
