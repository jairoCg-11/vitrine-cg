import { publicAPI, Store } from "@/lib/api";
import Header from "@/components/layout/Header";
import StoreCard from "@/components/store/StoreCard";
import Link from "next/link";

async function getStores(): Promise<Store[]> {
  try {
    return await publicAPI.getStores();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const stores = await getStores();
  const openStores = stores.filter((s) => s.is_open);
  const segments = [...new Set(stores.map((s) => s.segment).filter(Boolean))];

  // Lojas premium — aparecem na seção de destaque
  const featuredStores = stores.filter((s) => s.plan === "premium");

  // Demais lojas — aparecem na vitrine geral
  const regularStores = stores.filter((s) => s.plan !== "premium");

  return (
    <div className="min-h-screen">
      <Header />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-shopping-dark via-shopping-medium to-shopping-light text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="badge bg-white/10 text-orange-300 border border-orange-500/30 mb-4 text-sm px-4 py-2">
            🛍️ Shopping Popular de Campina Grande
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-4 mb-6 leading-tight">
            Tudo que você precisa
            <span className="text-orange-400"> em um só lugar</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Compre direto com os lojistas do shopping popular. Preços imbatíveis
            e atendimento personalizado via WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/lojas" className="btn-primary text-lg px-8 py-4">
              Ver todas as lojas →
            </Link>
            <Link
              href="#lojas"
              className="border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 inline-block"
            >
              Explorar agora
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
            <div className="text-center">
              <p className="text-3xl font-black text-orange-400">
                {stores.length}
              </p>
              <p className="text-white/60 text-sm">Lojas</p>
            </div>
            <div className="text-center border-x border-white/10">
              <p className="text-3xl font-black text-orange-400">
                {openStores.length}
              </p>
              <p className="text-white/60 text-sm">Abertas agora</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-orange-400">
                {segments.length}
              </p>
              <p className="text-white/60 text-sm">Categorias</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lojas em Destaque ─────────────────────────────────────────────
          Só renderiza se houver pelo menos uma loja premium.
          Este é o espaço monetizado — lojistas pagam para aparecer aqui.
      ─────────────────────────────────────────────────────────────────── */}
      {featuredStores.length > 0 && (
        <section className="py-12 px-4 bg-gradient-to-b from-amber-50 to-white">
          <div className="max-w-7xl mx-auto">
            {/* Cabeçalho da seção */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-400 rounded-full" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    ⭐ Lojas em Destaque
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Selecionadas especialmente para você
                  </p>
                </div>
              </div>
            </div>

            {/* Grid de lojas premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredStores.map((store) => (
                <StoreCard key={store.id} store={store} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Navegação por segmento ─────────────────────────────────────── */}
      {segments.length > 0 && (
        <section
          className="py-8 px-4 bg-white border-y border-gray-100"
          id="lojas"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-3 overflow-x-auto pb-2">
              <Link
                href="/lojas"
                className="flex-shrink-0 badge px-4 py-2 text-sm bg-gray-900 text-white"
              >
                Todas
              </Link>
              {segments.map((seg) => (
                <Link
                  key={seg}
                  href={`/lojas?categoria=${seg}`}
                  className="flex-shrink-0 badge px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition-colors capitalize"
                >
                  {seg}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Vitrine geral ─────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 bg-shopping-light rounded-full" />
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  🏪 Todas as Lojas
                </h2>
                <p className="text-gray-500 text-sm">
                  {stores.length}{" "}
                  {stores.length === 1
                    ? "loja cadastrada"
                    : "lojas cadastradas"}
                </p>
              </div>
            </div>
            <Link
              href="/lojas"
              className="text-orange-600 font-semibold text-sm hover:underline"
            >
              Ver todas →
            </Link>
          </div>

          {regularStores.length === 0 && featuredStores.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🏪</p>
              <p className="text-gray-500 text-lg">
                Nenhuma loja cadastrada ainda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {regularStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Lojista ───────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-700 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-black mb-4">
            Você tem uma loja no shopping?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Cadastre sua loja gratuitamente e comece a vender online hoje mesmo.
            Seus clientes já estão te procurando aqui!
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-orange-600 font-black px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-xl inline-block"
          >
            Cadastrar minha loja grátis →
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white/60 py-8 px-4 text-center text-sm">
        <p>© 2026 Vitrine CG — Shopping Virtual Popular de Campina Grande</p>
        <p className="mt-1">Feito com ❤️ para os lojistas de CG</p>
      </footer>
    </div>
  );
}
