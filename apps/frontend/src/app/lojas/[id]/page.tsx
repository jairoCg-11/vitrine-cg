import { publicAPI, StoreDetail } from "@/lib/api";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const store = await getStore(Number(id));

  if (!store) {
    return {
      title: "Loja não encontrada",
      description: "Esta loja não está disponível no Vitrine CG.",
    };
  }

  const descriptionParts = [
    store.description,
    store.segment && `Segmento: ${store.segment}`,
    store.location && `Localização: ${store.location}`,
    "Atendimento via WhatsApp no Vitrine CG — Shopping Popular de Campina Grande.",
  ].filter(Boolean);

  return {
    title: store.name,
    description: descriptionParts.join(" "),
    openGraph: {
      title: `${store.name} — Vitrine CG`,
      description: descriptionParts.join(" "),
      url: `https://vitrine-cg.inovautomatica.com/lojas/${store.id}`,
      images: store.logo_url ? [{ url: store.logo_url, alt: store.name }] : [],
    },
  };
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
    <div className="min-h-screen pb-24 md:pb-0">
      <Header />

      {/* Capa */}
      <div className="relative h-40 md:h-72 bg-gradient-to-br from-shopping-light to-shopping-accent">
        {store.cover_url && (
          <Image
            src={store.cover_url}
            alt={store.name}
            fill
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Card de info da loja */}
        <div className="relative -mt-12 md:-mt-16 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4 flex-wrap">
              {/* Logo */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white shadow-lg bg-gray-100">
                {store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white font-black text-2xl">
                    {store.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Dados */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-black text-gray-900">
                    {store.name}
                  </h1>
                  <span
                    className={`badge text-xs ${store.is_open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {store.is_open ? "● Aberta" : "● Fechada"}
                  </span>
                </div>
                {store.segment && (
                  <span className="badge bg-orange-100 text-orange-700 mt-1 text-xs">
                    {store.segment}
                  </span>
                )}
                {store.description && (
                  <p className="text-gray-600 mt-2 text-sm">
                    {store.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                  {store.location && <span>📍 {store.location}</span>}
                  {store.instagram && <span>📸 {store.instagram}</span>}
                </div>
              </div>

              {/* Botão WhatsApp — desktop (inline) */}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex btn-whatsapp flex-shrink-0"
                >
                  <span>💬</span>
                  <span>Falar no WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="pb-6">
          <h2 className="text-lg md:text-xl font-black text-gray-900 mb-4">
            🛍️ Produtos ({availableProducts.length})
          </h2>

          {availableProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-500 text-sm">
                Nenhum produto disponível no momento.
              </p>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp inline-flex mt-4 text-sm"
                >
                  💬 Perguntar pelo WhatsApp
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {availableProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  whatsappUrl={whatsappUrl}
                  storeName={store.name}
                  storeId={store.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Botão WhatsApp fixo no rodapé — mobile apenas ──────────────────── */}
      {whatsappUrl && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-100 shadow-2xl">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full justify-center text-base py-3.5"
          >
            <span>💬</span>
            <span>Falar com {store.name} no WhatsApp</span>
          </a>
        </div>
      )}

      <footer className="bg-gray-900 text-white/60 py-6 px-4 text-center text-xs">
        <p>© 2026 Vitrine CG — Shopping Virtual Popular de Campina Grande</p>
      </footer>
    </div>
  );
}
