import { publicAPI, SearchResult } from "@/lib/api";
import Header from "@/components/layout/Header";
import StoreCard from "@/components/store/StoreCard";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";

async function search(q: string): Promise<SearchResult> {
  try {
    return await publicAPI.search(q);
  } catch {
    return { stores: [], products: [] };
  }
}

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscaPage({ searchParams }: Props) {
  const { q } = await searchParams;

  if (!q || q.length < 2) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-gray-500 text-lg">Digite pelo menos 2 caracteres para buscar.</p>
        </div>
      </div>
    );
  }

  const results = await search(q);
  const total = results.stores.length + results.products.length;

  return (
    <div className="min-h-screen">
      <Header />

      <section className="bg-gradient-to-r from-shopping-dark to-shopping-medium text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black mb-2">
            🔍 Resultados para &quot;{q}&quot;
          </h1>
          <p className="text-white/70">
            {total} {total === 1 ? "resultado encontrado" : "resultados encontrados"}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {total === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">😕</p>
            <p className="text-gray-500 text-lg mb-6">Nenhum resultado para &quot;{q}&quot;</p>
            <Link href="/lojas" className="btn-primary inline-block">Ver todas as lojas</Link>
          </div>
        ) : (
          <>
            {results.stores.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-black text-gray-900 mb-6">
                  🏪 Lojas ({results.stores.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.stores.map((store) => (
                    <StoreCard key={store.id} store={store} />
                  ))}
                </div>
              </div>
            )}

            {results.products.length > 0 && (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-6">
                  🛍️ Produtos ({results.products.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {results.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      whatsappUrl={null}
                      storeName=""
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="bg-gray-900 text-white/60 py-8 px-4 text-center text-sm">
        <p>© 2026 Vitrine CG — Shopping Virtual Popular de Campina Grande</p>
      </footer>
    </div>
  );
}
