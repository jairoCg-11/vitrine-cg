"use client";

import Link from "next/link";
import Image from "next/image";
import { Store } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Props {
  store: Store;
  featured?: boolean;
}

export default function StoreCard({ store, featured = false }: Props) {
  const isPremium = store.plan === "premium";

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!store.whatsapp) return;
    fetch(`${API_URL}/public/stores/${store.id}/events/whatsapp`, {
      method: "POST",
    }).catch(() => {});
    window.open(
      `https://wa.me/55${store.whatsapp.replace(/\D/g, "")}?text=Olá! Vi sua loja no Vitrine CG e tenho interesse!`,
      "_blank",
    );
  };

  return (
    <Link href={`/lojas/${store.id}`}>
      <div
        className={`card cursor-pointer group relative ${
          isPremium ? "ring-2 ring-orange-400 shadow-lg shadow-orange-100" : ""
        }`}
      >
        {isPremium && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-400 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
              ⭐ Destaque
            </span>
          </div>
        )}

        <div className="relative h-40 bg-gradient-to-br from-shopping-dark to-shopping-medium overflow-hidden">
          {store.cover_url ? (
            <Image
              src={store.cover_url}
              alt={store.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-10">
              <span
                className="text-white font-black"
                style={{ fontSize: "5rem" }}
              >
                {store.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-3 right-3">
            <span
              className={`badge text-xs ${
                store.is_open
                  ? "bg-green-500 text-white"
                  : "bg-gray-600/80 text-white"
              }`}
            >
              {store.is_open ? "● Aberta" : "● Fechada"}
            </span>
          </div>
        </div>

        <div className="p-4 pt-3">
          <div className="flex items-start gap-3">
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
                  unoptimized
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white font-black text-lg">
                  {store.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 mt-1">
              <h3 className="font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                {store.name}
              </h3>
              {store.segment && (
                <span className="badge bg-orange-100 text-orange-700 mt-1 text-xs capitalize">
                  {store.segment}
                </span>
              )}
            </div>
          </div>

          {store.description && (
            <p className="text-gray-400 text-xs mt-3 line-clamp-2 leading-relaxed">
              {store.description}
            </p>
          )}

          {store.location && (
            <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
              <span>📍</span> {store.location}
            </p>
          )}

          {store.whatsapp && (
            <button
              onClick={handleWhatsApp}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-500 hover:text-white transition-all duration-200"
            >
              <span>💬</span> Falar no WhatsApp
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
