import { publicAPI, StoreDetail } from "@/lib/api";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getStore(id: number): Promise<StoreDetail | null> {
  try {
    return await publicAPI.getStore(id);
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  const store = await getStore(Number(id));

  if (!store) notFound();

  const availableProducts = store.products.filter((p) => p.is_available);

  const whatsappUrl = store.whatsapp
    ? `https://wa.me/55${store.whatsapp.replace(/\D/g, "")}?text=Olá! Vi sua loja no Vitrine CG e tenho interesse!`
    : null;

  return (
    <div className="min-h-screen">
      <Header />

      <div className="relative h-56 md:h-72 bg-gradient-to-br from-shopping-light to-shopping-accent">
        {store.cover_url && (
          <Image
            src={store.cover_url}
            alt={store.name}
            fill
            unoptimized={true}
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="relative -mt-16 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white shadow-lg bg-gray-100">
                {store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    width={80}
                    height={80}
                    unoptimized={true}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white font-black text-2xl">
                    {store.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-black text-gray-900">{store.name}</h1>
                  <span className={`badge ${store.is_open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {store.is_open ? "● Aberta" : "● Fechada"}
                  </span>
                </div>
                {store.segment && (
                  <span className="badge bg-orange-100 text-orange-700 mt-1">{store.segment}</span>
                )}
                {store.description && (
                  <p className="text-gray-600 mt-2">{store.description}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  {store.location && <span>📍 {store.location}</span>}
                  {store.instagram && <span>📸 {store.instagram}</span>}
                </div>
              </div>

              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp flex-shrink-0">
                  <span>💬</span>
                  <span>Falar no WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pb-16">
          <h2 className="text-xl font-black text-gray-900 mb-6">
            🛍️ Produtos ({availableProducts.length})
          </h2>

          {availableProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-500">Nenhum produto disponível no momento.</p>
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp inline-flex mt-4">
                  💬 Perguntar pelo WhatsApp
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {availableProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  whatsappUrl={whatsappUrl}
                  storeName={store.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="bg-gray-900 text-white/60 py-8 px-4 text-center text-sm">
        <p>© 2026 Vitrine CG — Shopping Virtual Popular de Campina Grande</p>
      </footer>
    </div>
  );
}
