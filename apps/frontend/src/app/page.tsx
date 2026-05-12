import { publicAPI, Store, Banner } from "@/lib/api";
import Header from "@/components/layout/Header";
import StoreCard from "@/components/store/StoreCard";
import HeroBanner from "@/components/banner/HeroBanner";
import StatsCounter from "@/components/home/StatsCounter";
import Link from "next/link";

async function getStores(): Promise<Store[]> {
  try {
    return await publicAPI.getStores();
  } catch {
    return [];
  }
}

async function getBanners(): Promise<Banner[]> {
  try {
    return await publicAPI.getBanners();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [stores, banners] = await Promise.all([getStores(), getBanners()]);

  const openStores = stores.filter((s) => s.is_open);
  const segments = [...new Set(stores.map((s) => s.segment).filter(Boolean))];
  const featuredStores = stores.filter((s) => s.plan === "premium");
  const regularStores = stores.filter((s) => s.plan !== "premium");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── Hero / Carrossel ─────────────────────────────────────────────── */}
      <HeroBanner banners={banners} />

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <StatsCounter
        totalStores={stores.length}
        openStores={openStores.length}
        segments={segments.length}
      />

      {/* ── Lojas em Destaque ─────────────────────────────────────────────── */}
      {featuredStores.length > 0 && (
        <section className="py-12 px-4 bg-gradient-to-b from-amber-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-400 rounded-full" />
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  ⭐ Lojas em Destaque
                </h2>
                <p className="text-gray-500 text-sm">
                  Selecionadas especialmente para você
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredStores.map((store) => (
                <StoreCard key={store.id} store={store} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Navegação por segmento ────────────────────────────────────────── */}
      {segments.length > 0 && (
        <section
          className="py-6 px-4 bg-white border-y border-gray-100"
          id="lojas"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Link
                href="/lojas"
                className="flex-shrink-0 badge px-4 py-2 text-sm bg-gray-900 text-white font-semibold"
              >
                Todas
              </Link>
              {segments.map((seg) => (
                <Link
                  key={seg}
                  href={`/lojas?categoria=${seg}`}
                  className="flex-shrink-0 badge px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition-colors capitalize font-medium"
                >
                  {seg}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Vitrine geral ─────────────────────────────────────────────────── */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-orange-500 rounded-full" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {regularStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Como funciona ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-shopping-dark text-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Para lojistas
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black mb-12 leading-tight">
            Comece a vender em 3 passos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "1",
                title: "Crie sua conta",
                text: "Cadastro gratuito em minutos. Aceite os termos e sua loja já está criada.",
              },
              {
                num: "2",
                title: "Publique produtos",
                text: "Adicione fotos, preços e descrições. Compressão automática das imagens.",
              },
              {
                num: "3",
                title: "Receba clientes",
                text: "Seus clientes te encontram e falam direto pelo WhatsApp. Simples assim.",
              },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center font-display font-black text-xl">
                    {step.num}
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-pulse-ring" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Lojista ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="font-display text-3xl md:text-4xl font-black mb-4 leading-tight">
            Você tem uma loja no shopping?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Cadastre sua loja gratuitamente e comece a vender online hoje mesmo.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-white text-orange-600 font-black px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-xl text-lg"
          >
            Cadastrar minha loja grátis →
          </Link>
          <p className="text-white/50 text-xs mt-4">
            ✓ Grátis para começar &nbsp;·&nbsp; ✓ Sem cartão de crédito
            &nbsp;·&nbsp; ✓ Aprovação em 24h
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white/40 py-8 px-4 text-center text-sm">
        <p>© 2026 Vitrine CG — Shopping Virtual Popular de Campina Grande</p>
        <p className="mt-1 text-xs">Feito com ❤️ para os lojistas de CG</p>
      </footer>
    </div>
  );
}
