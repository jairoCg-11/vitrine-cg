import { publicAPI, Product, StoreDetail } from "@/lib/api";
import Header from "@/components/layout/Header";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// ─── Busca os dados do produto e da loja em paralelo ─────────────────────────
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

// ─── generateMetadata ─────────────────────────────────────────────────────────
//
// Mesmo conceito da página de loja, mas para produtos.
//
// Por que produtos precisam de SEO?
// Pense no seguinte cenário: alguém busca no Google
// "Camiseta Básica Branca Campina Grande"
// Se essa página tiver o título e descrição corretos, ela pode aparecer
// nos resultados — trazendo tráfego direto sem nenhum custo de marketing.
//
// Para o lojista com plano premium, isso é ainda mais valioso:
// seus produtos aparecem no Google e o cliente já chega com intenção de compra.
//
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, productId } = await params;
  const data = await getData(Number(id), Number(productId));

  if (!data) {
    return {
      title: "Produto não encontrado",
      description: "Este produto não está disponível no Vitrine CG.",
    };
  }

  const { store, product } = data;

  // Formata o preço no padrão brasileiro
  const priceFormatted = `R$ ${Number(product.price).toFixed(2).replace(".", ",")}`;

  // Descrição rica para o Google
  const descriptionParts = [
    product.description,
    `Preço: ${priceFormatted}`,
    product.category && `Categoria: ${product.category}`,
    `Vendido por ${store.name} no Vitrine CG — Shopping Popular de Campina Grande.`,
    "Entre em contato via WhatsApp.",
  ].filter(Boolean);

  const description = descriptionParts.join(" ");

  return {
    // Resultado: "Camiseta Básica Branca | Vitrine CG"
    title: product.name,

    description,

    // Open Graph — quando o link do produto for compartilhado no WhatsApp,
    // vai aparecer a foto do produto, o nome e o preço
    openGraph: {
      title: `${product.name} — ${store.name} | Vitrine CG`,
      description,
      url: `https://vitrine-cg.com.br/lojas/${store.id}/produtos/${product.id}`,
      images: product.image_url
        ? [{ url: product.image_url, alt: product.name }]
        : [],
    },
  };
}

// ─── Componente da página ─────────────────────────────────────────────────────
export default async function ProductPage({ params }: Props) {
  const { id, productId } = await params;
  const data = await getData(Number(id), Number(productId));

  if (!data) notFound();

  const { store, product } = data;
  const ALL_SIZES = ["PP", "P", "M", "G", "GG", "XG"];
  const availableSizes = product.sizes ? product.sizes.split(",") : [];
  const showSizes = product.category === "roupas";

  const whatsappUrl = store.whatsapp
    ? `https://wa.me/55${store.whatsapp.replace(/\D/g, "")}?text=Olá! Vi o produto "${product.name}" na loja ${store.name} no Vitrine CG e tenho interesse!`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb — também ajuda no SEO (Google entende a hierarquia do site) */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-orange-600 transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link
            href="/lojas"
            className="hover:text-orange-600 transition-colors"
          >
            Lojas
          </Link>
          <span>/</span>
          <Link
            href={`/lojas/${store.id}`}
            className="hover:text-orange-600 transition-colors"
          >
            {store.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Imagem */}
            <div className="relative h-72 md:h-full min-h-72 bg-gray-100">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  unoptimized={true}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200">
                  📦
                </div>
              )}
            </div>

            {/* Dados do produto */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                {product.category && (
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mb-3 capitalize">
                    {product.category}
                  </span>
                )}

                <h1 className="text-2xl font-black text-gray-900 mb-3">
                  {product.name}
                </h1>

                {product.description && (
                  <p className="text-gray-500 text-sm mb-4">
                    {product.description}
                  </p>
                )}

                {showSizes && availableSizes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      TAMANHOS DISPONÍVEIS
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_SIZES.map((s) => {
                        const available = availableSizes.includes(s);
                        return (
                          <span
                            key={s}
                            className={`w-10 h-10 flex items-center justify-center text-xs font-bold rounded-lg border-2 ${
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
                  </div>
                )}

                <p className="text-3xl font-black text-orange-600 mb-6">
                  R$ {Number(product.price).toFixed(2).replace(".", ",")}
                </p>
              </div>

              {/* Loja */}
              <div className="border-t border-gray-100 pt-5 mb-5">
                <p className="text-xs text-gray-400 mb-1">Vendido por</p>
                <Link
                  href={`/lojas/${store.id}`}
                  className="font-semibold text-gray-800 hover:text-orange-600 transition-colors"
                >
                  {store.name}
                </Link>
                {store.location && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    📍 {store.location}
                  </p>
                )}
              </div>

              {/* CTA WhatsApp */}
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp justify-center text-base py-3"
                >
                  <span>💬</span>
                  <span>Tenho interesse — falar no WhatsApp</span>
                </a>
              ) : (
                <Link
                  href={`/lojas/${store.id}`}
                  className="btn-primary text-center py-3"
                >
                  Ver loja completa
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href={`/lojas/${store.id}`}
            className="text-sm text-gray-500 hover:text-orange-600 transition-colors"
          >
            ← Ver todos os produtos de {store.name}
          </Link>
        </div>
      </div>

      <footer className="bg-gray-900 text-white/60 py-8 px-4 text-center text-sm mt-12">
        <p>© 2026 Vitrine CG — Shopping Virtual Popular de Campina Grande</p>
      </footer>
    </div>
  );
}
