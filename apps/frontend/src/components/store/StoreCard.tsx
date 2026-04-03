"use client";

import Link from "next/link";
import Image from "next/image";
import { Store } from "@/lib/api";

interface Props {
  store: Store;
}

export default function StoreCard({ store }: Props) {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(
      `https://wa.me/55${store.whatsapp?.replace(/\D/g, "")}?text=Olá! Vi sua loja no Vitrine CG e tenho interesse!`,
      "_blank"
    );
  };

  return (
    <Link href={`/lojas/${store.id}`}>
      <div className="card cursor-pointer group">
        {/* Capa */}
        <div className="relative h-36 bg-gradient-to-br from-blue-900 to-red-500 overflow-hidden">
          {store.cover_url ? (
            <Image
              src={store.cover_url}
              alt={store.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
              🏪
            </div>
          )}

          {/* Badge aberta/fechada */}
          <div className="absolute top-3 right-3">
            <span
              className={`badge ${
                store.is_open ? "bg-green-500 text-white" : "bg-gray-500 text-white"
              }`}
            >
              {store.is_open ? "● Aberta" : "● Fechada"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Logo */}
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border-2 border-white shadow-md -mt-8 relative z-10">
              {store.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white font-black text-lg">
                  {store.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
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

          {/* WhatsApp */}
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
