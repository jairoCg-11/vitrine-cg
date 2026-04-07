import { publicAPI, Product, StoreDetail } from "@/lib/api";
import Header from "@/components/layout/Header";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getData(storeId: number, productId: number): Promise<{ store: StoreDetail; product: Product } | null> {
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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-orange-600 transition-colors">Início</Link>
          <span>/</span>
          <Link href="/lojas" className="hover:text-orange-600 transition-colors">Lojas</Link>
          <span>/</span>
          <Link href={`/lojas/${store.id}`} className="hover:text-orange-600 transition-colors">{store.name}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
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
                <div className="w-full h-full flex items-center justify-center text-8xl text-gray-200">
                  📦
                </div>
              )}
            </div>

            {/* Detalhes */}
            <div className="p-8 flex flex-col">
              <div className="flex-1">
                {product.category && (
                  <span className="badge bg-orange-100 text-orange-700 mb-3 inline-block capitalize">
                    {product.category}
                  </span>
                )}

                <h1 className="text-2xl font-black text-gray-900 mb-3">{product.name}</h1>

                {product.description && (
                  <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
                )}

                {/* Tamanhos */}
                {showSizes && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">Tamanhos</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                          Disponível
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" />
                          Indisponível
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ALL_SIZES.map((s) => {
                        const available = availableSizes.includes(s);
                        return (
                          <span
                            key={s}
                            className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 text-sm font-black transition-all ${
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
                <Link href={`/lojas/${store.id}`} className="font-semibold text-gray-800 hover:text-orange-600 transition-colors">
                  {store.name}
                </Link>
                {store.location && (
                  <p className="text-sm text-gray-500 mt-0.5">📍 {store.location}</p>
                )}
              </div>

              {/* CTA */}
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

        {/* Voltar */}
        <div className="mt-6">
          <Link href={`/lojas/${store.id}`} className="text-sm text-gray-500 hover:text-orange-600 transition-colors">
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
