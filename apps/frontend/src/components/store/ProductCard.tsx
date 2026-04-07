"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/api";

interface Props {
  product: Product;
  whatsappUrl: string | null;
  storeName: string;
  storeId?: number;
}

export default function ProductCard({ product, whatsappUrl, storeName, storeId }: Props) {
  const resolvedStoreId = storeId ?? product.store_id;
  const detailHref = `/lojas/${resolvedStoreId}/produtos/${product.id}`;
  const ALL_SIZES = ["PP", "P", "M", "G", "GG", "XG"];
  const availableSizes = product.sizes ? product.sizes.split(",") : [];
  const showSizes = product.category === "roupas";

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!whatsappUrl) return;
    const base = whatsappUrl.split("?text=")[0];
    const url = `${base}?text=Olá! Vi o produto "${product.name}" na loja ${storeName} no Vitrine CG e tenho interesse!`;
    window.open(url, "_blank");
  };

  return (
    <div className="card group">
      <Link href={detailHref} className="block">
        <div className="relative h-40 bg-gray-100 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              unoptimized={true}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
              📦
            </div>
          )}
          {product.category && (
            <div className="absolute top-2 left-2">
              <span className="badge bg-white/90 text-gray-700 text-xs shadow">
                {product.category}
              </span>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{product.description}</p>
          )}

          {showSizes && (
            <div className="flex flex-wrap gap-1 mt-2">
              {ALL_SIZES.map((s) => {
                const available = availableSizes.includes(s);
                return (
                  <span
                    key={s}
                    className={`text-xs font-bold rounded px-1.5 py-0.5 border ${
                      available
                        ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                        : "bg-gray-50 border-gray-200 text-gray-300"
                    }`}
                  >
                    {s}
                  </span>
                );
              })}
            </div>
          )}

          <p className="text-orange-600 font-black text-lg mt-2">
            R$ {Number(product.price).toFixed(2).replace(".", ",")}
          </p>
        </div>
      </Link>

      {whatsappUrl && (
        <div className="px-3 pb-3">
          <button
            onClick={handleWhatsApp}
            className="w-full btn-whatsapp text-xs py-2 justify-center"
          >
            💬 Tenho interesse
          </button>
        </div>
      )}
    </div>
  );
}
