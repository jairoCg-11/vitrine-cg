"use client";

import Link from "next/link";
import Image from "next/image";
import { Store, Product } from "@/lib/api";
import PriceDisplay from "@/components/product/PriceDisplay";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Props {
  store: Store;
  featured?: boolean;
}

// ─── StoreCard ────────────────────────────────────────────────────────────────
// Card de loja exibido na home e na listagem de lojas.

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

// ─── ProductCard ──────────────────────────────────────────────────────────────
// Card de produto exibido na página da loja.

interface ProductCardProps {
  product: Product;
  whatsappUrl: string | null;
  storeName: string;
  storeId: number;
}

export function ProductCard({
  product,
  whatsappUrl,
  storeName,
  storeId,
}: ProductCardProps) {
  const ALL_SIZES = ["PP", "P", "M", "G", "GG", "XG"];
  const availableSizes = product.sizes ? product.sizes.split(",") : [];
  const showSizes =
    product.category?.toLowerCase() === "roupas" && availableSizes.length > 0;
  const isPromo =
    product.original_price &&
    Number(product.original_price) > Number(product.price);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!whatsappUrl) return;
    fetch(`${API_URL}/public/stores/${storeId}/events/whatsapp`, {
      method: "POST",
    }).catch(() => {});
    window.open(
      whatsappUrl.includes("text=")
        ? whatsappUrl.replace(
            /text=.*/,
            `text=Olá! Tenho interesse no produto "${product.name}"!`,
          )
        : `${whatsappUrl}&text=Olá! Tenho interesse no produto "${product.name}"!`,
      "_blank",
    );
  };

  return (
    <Link href={`/lojas/${storeId}/produtos/${product.id}`}>
      <div className="card cursor-pointer group relative">
        {/* Badge promoção */}
        {isPromo && (
          <div className="absolute top-2 left-2 z-10">
            <span className="badge bg-red-500 text-white text-xs font-black px-2 py-1">
              🔥 Promoção
            </span>
          </div>
        )}

        {/* Imagem */}
        <div className="relative h-44 bg-gray-100 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">
              📦
            </div>
          )}
          {product.category && (
            <div className="absolute bottom-2 left-2">
              <span className="badge bg-white/90 text-gray-600 text-xs capitalize shadow">
                {product.category}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-orange-600 transition-colors mb-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-gray-400 text-xs line-clamp-2 mb-2">
              {product.description}
            </p>
          )}

          {/* Tamanhos */}
          {showSizes && (
            <div className="flex flex-wrap gap-1 mb-2">
              {ALL_SIZES.map((s) => {
                const available = availableSizes.includes(s);
                return available ? (
                  <span
                    key={s}
                    className="text-xs px-1.5 py-0.5 rounded border border-orange-300 text-orange-700 bg-orange-50 font-semibold"
                  >
                    {s}
                  </span>
                ) : (
                  <span
                    key={s}
                    className="text-xs px-1.5 py-0.5 rounded border border-gray-200 text-gray-300 line-through"
                  >
                    {s}
                  </span>
                );
              })}
            </div>
          )}

          {/* Preço */}
          <div className="mb-2">
            <PriceDisplay
              price={product.price}
              originalPrice={product.original_price}
              showPrice={product.show_price}
              size="sm"
            />
          </div>

          {/* Botão WhatsApp */}
          {whatsappUrl && (
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-all"
            >
              💬 Tenho interesse
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
