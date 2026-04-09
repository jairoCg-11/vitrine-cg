import { publicAPI, Product, StoreDetail } from "@/lib/api";
import Header from "@/components/layout/Header";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

async function getData(
  storeId: number,
  productId: number,
): Promise<{ store: StoreDetail; product: Product } | null> {
  try {
    const [store, product] = await Promise.all([
      publicAPI.getStore(storeId),
      publicAPI.getProduct(storeId, productId),
    ]);
    return { store, product };
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ id: string; productId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, productId } = await params;
  const data = await getData(Number(id), Number(productId));
  if (!data) return { title: "Produto não encontrado" };

  const { store, product } = data;
  const price = `R$ ${Number(product.price).toFixed(2).replace(".", ",")}`;
  const description = [
    product.description,
    `Preço: ${price}`,
    `Vendido por ${store.name} no Vitrine CG.`,
  ].filter(Boolean).join(" ");

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} — ${store.name} | Vitrine CG`,
      description,
      images: product.image_url ? [{ url: product.image_url, alt: product.name }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id, productId } = await params;
  const data = await getData(Number(id), Number(productId));
  if (!data) notFound();

  const { store, product } = data;
  const ALL_SIZES = ["PP", "P", "M", "G", "GG", "XG"];
  const availableSizes = product.sizes ? product.sizes.split(",") : [];
  const showSizes = product.category?.toLowerCase() === "roupas";
  const price = `R$ ${Number(product.price).toFixed(2).replace(".", ",")}`;

  const whatsappUrl = store.whatsapp
    ? `https://wa.me/55${store.whatsapp.replace(/\D/g, "")}?text=Olá! Vi o produto "${product.name}" na loja ${store.name} no Vitrine CG e tenho interesse!`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-orange-600 transition-colors">Início</Link>
          <span>/</span>
          <Link href="/lojas" className="hover:text-orange-600 transition-colors">Lojas</Link>
          <span>/</span>
          <Link href={`/lojas/${store.id}`} className="hover:text-orange-600 transition-colors truncate max-w-24">
            {store.name}
          </Link>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-32">{product.name}</span>
        </nav>

        {/* Layout principal */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* ── Imagem ──────────────────────────────────────────────────── */}
            <div className="relative bg-gray-100" style={{ minHeight: "320px" }}>
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                  <span className="text-6xl mb-2">📦</span>
                  <span className="text-sm">Sem foto</span>
                </div>
              )}

              {/* Badge categoria */}
              {product.category && (
                <div className="absolute top-3 left-3">
                  <span className="badge bg-white/90 text-gray-700 text-xs shadow-md capitalize">
                    {product.category}
                  </span>
                </div>
              )}
            </div>

            {/* ── Informações ─────────────────────────────────────────────── */}
            <div className="p-5 md:p-8 flex flex-col gap-4">

              {/* Nome */}
              <div>
                <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Preço em destaque */}
              <div className="bg-orange-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Preço</p>
                <p className="text-3xl md:text-4xl font-black text-orange-600">
                  {price}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Entre em contato para mais informações de pagamento
                </p>
              </div>

              {/* Tamanhos */}
              {showSizes && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Tamanhos disponíveis
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map((s) => {
                      const available = availableSizes.includes(s);
                      return (
                        <span
                          key={s}
                          className={`w-11 h-11 flex items-center justify-center text-sm font-bold rounded-xl border-2 transition-all ${
                            available
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-200 bg-gray-50 text-gray-300 line-through"
                          }`}
                        >
                          {s}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Descrição */}
              {product.description && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Descrição
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Vendido por */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-2">Vendido por</p>
                <Link href={`/lojas/${store.id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {store.logo_url ? (
                      <Image src={store.logo_url} alt={store.name} width={40} height={40} unoptimized className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white font-black">
                        {store.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition-colors">
                      {store.name}
                    </p>
                    {store.location && (
                      <p className="text-xs text-gray-400">📍 {store.location}</p>
                    )}
                  </div>
                </Link>
              </div>

              {/* CTA — desktop */}
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex btn-whatsapp justify-center text-base py-4 rounded-2xl"
                >
                  <span>💬</span>
                  <span>Tenho interesse — falar no WhatsApp</span>
                </a>
              ) : (
                <Link href={`/lojas/${store.id}`} className="hidden md:block btn-primary text-center py-4 rounded-2xl">
                  Ver loja completa
                </Link>
              )}

              {/* Ver mais produtos */}
              <Link
                href={`/lojas/${store.id}`}
                className="text-center text-sm text-orange-600 hover:underline font-semibold"
              >
                ← Ver todos os produtos de {store.name}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Botão WhatsApp fixo — mobile ─────────────────────────────────── */}
      {whatsappUrl && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-100 shadow-2xl">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full justify-center text-base py-4 rounded-2xl"
          >
            <span>💬</span>
            <span>Tenho interesse — falar no WhatsApp</span>
          </a>
        </div>
      )}

      <footer className="bg-gray-900 text-white/60 py-6 px-4 text-center text-xs mt-8">
        <p>© 2026 Vitrine CG — Shopping Virtual Popular de Campina Grande</p>
      </footer>
    </div>
  );
}
