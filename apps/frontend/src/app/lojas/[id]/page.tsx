import { publicAPI, StoreDetail } from "@/lib/api";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/store/ProductCard";
import StoreEditButton from "@/components/store/StoreEditButton";
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
  if (!store) return { title: "Loja não encontrada" };

  const description = [
    store.description,
    store.segment && `Segmento: ${store.segment}`,
    store.location && `Localização: ${store.location}`,
    "Atendimento via WhatsApp no Vitrine CG.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title: store.name,
    description,
    openGraph: {
      title: `${store.name} — Vitrine CG`,
      description,
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
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      <Header />

      {/* ── Capa ─────────────────────────────────────────────────────────── */}
      <div className="relative h-48 md:h-72 bg-gradient-to-br from-shopping-dark via-shopping-medium to-shopping-light overflow-hidden">
        {store.cover_url ? (
          <Image
            src={store.cover_url}
            alt={store.name}
            fill
            unoptimized
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
            <span
              className="text-white font-black"
              style={{ fontSize: "20vw" }}
            >
              {store.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-3 left-4">
          <Link
            href="/lojas"
            className="text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            ← Todas as lojas
          </Link>
        </div>

        <div className="absolute top-3 right-4">
          <span
            className={`badge text-xs ${store.is_open ? "bg-green-500 text-white" : "bg-gray-700 text-white"}`}
          >
            {store.is_open ? "● Aberta agora" : "● Fechada"}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* ── Card info ────────────────────────────────────────────────────── */}
        <div className="relative -mt-10 md:-mt-14 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-5">
              {/* Logo */}
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white shadow-lg bg-gray-100 -mt-8 md:-mt-10">
                {store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    width={96}
                    height={96}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 text-white font-black text-2xl md:text-3xl">
                    {store.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Dados */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900">
                      {store.name}
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {store.segment && (
                        <span className="badge bg-orange-100 text-orange-700 text-xs capitalize">
                          {store.segment}
                        </span>
                      )}
                    </div>
                  </div>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden md:flex btn-whatsapp text-sm flex-shrink-0"
                    >
                      <span>💬</span>
                      <span>Falar no WhatsApp</span>
                    </a>
                  )}
                </div>

                {store.description && (
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    {store.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 mt-3">
                  {store.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      📍 {store.location}
                    </span>
                  )}
                  {store.instagram && (
                    <a
                      href={`https://instagram.com/${store.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-500 transition-colors"
                    >
                      📸 {store.instagram}
                    </a>
                  )}
                </div>

                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-black text-orange-500">
                      {availableProducts.length}
                    </p>
                    <p className="text-xs text-gray-400">
                      {availableProducts.length === 1 ? "produto" : "produtos"}
                    </p>
                  </div>
                  {store.whatsapp && (
                    <div className="text-center">
                      <p className="text-lg font-black text-green-500">💬</p>
                      <p className="text-xs text-gray-400">WhatsApp</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Produtos ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-lg md:text-xl font-black text-gray-900 mb-4">
            🛍️ Produtos ({availableProducts.length})
          </h2>

          {availableProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-md">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-gray-500 text-lg font-semibold mb-1">
                Nenhum produto disponível
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Esta loja está atualizando o catálogo.
              </p>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp inline-flex text-sm"
                >
                  💬 Perguntar disponibilidade pelo WhatsApp
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

      {/* ── Botão WhatsApp fixo — mobile ─────────────────────────────────── */}
      {whatsappUrl && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-white border-t border-gray-100 shadow-2xl">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full justify-center text-sm py-3.5 rounded-2xl"
          >
            <span>💬</span>
            <span>Falar com {store.name} no WhatsApp</span>
          </a>
        </div>
      )}

      {/* ── Botão flutuante de edição — só para o dono da loja ──────────── */}
      <StoreEditButton storeId={store.id} ownerId={store.owner_id} />

      <footer className="bg-gray-900 text-white/60 py-6 px-4 text-center text-xs">
        <p>© 2026 Vitrine CG — Shopping Virtual Popular de Campina Grande</p>
      </footer>
    </div>
  );
}
