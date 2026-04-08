import { MetadataRoute } from "next";

// ─── sitemap.ts ───────────────────────────────────────────────────────────────
//
// Este arquivo gera automaticamente a URL:
//   https://vitrine-cg.com.br/sitemap.xml
//
// O sitemap é uma lista de TODAS as URLs públicas do site.
// O Google usa essa lista para saber quais páginas existem e quando
// foram atualizadas — sem ele, o Google precisa "descobrir" as páginas
// por conta própria, o que é muito mais lento.
//
// Analogia: o sitemap é como um índice de um livro.
// Em vez de ler o livro inteiro para saber o que tem lá,
// o Google consulta o índice e já sabe tudo de uma vez.
//
// Como funciona:
//   1. Ao ser acessado, este arquivo busca todas as lojas ativas na API
//   2. Para cada loja, busca seus produtos
//   3. Gera uma entrada no sitemap para cada URL
//   4. O Next.js serializa tudo para XML automaticamente
//
// changeFrequency → com que frequência o Google deve revisitar a página
// priority        → importância relativa (0 a 1). A home vale mais que um produto.
//

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://vitrine-cg.com.br";

// Tipos mínimos que precisamos da API
interface StoreBasic {
  id: number;
}

interface ProductBasic {
  id: number;
  store_id: number;
  is_available: boolean;
}

interface StoreDetail extends StoreBasic {
  products: ProductBasic[];
}

async function fetchAllStores(): Promise<StoreBasic[]> {
  try {
    const res = await fetch(`${API_URL}/public/stores`, {
      // next.revalidate → o sitemap é regenerado a cada 1 hora
      // Isso evita que uma loja nova fique de fora por muito tempo
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchStoreWithProducts(
  storeId: number,
): Promise<StoreDetail | null> {
  try {
    const res = await fetch(`${API_URL}/public/stores/${storeId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Páginas estáticas ──────────────────────────────────────────────────────
  // Sempre presentes, independente dos dados do banco
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily", // A home muda todo dia (novas lojas)
      priority: 1.0, // Prioridade máxima
    },
    {
      url: `${SITE_URL}/lojas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/busca`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // ── Páginas dinâmicas (lojas e produtos) ──────────────────────────────────
  const stores = await fetchAllStores();

  // Para cada loja, buscamos seus produtos em paralelo
  const storeDetails = await Promise.all(
    stores.map((s) => fetchStoreWithProducts(s.id)),
  );

  // Entradas das páginas de lojas
  const storeRoutes: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${SITE_URL}/lojas/${store.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const, // Lojas mudam com menos frequência
    priority: 0.8,
  }));

  // Entradas das páginas de produtos
  const productRoutes: MetadataRoute.Sitemap = storeDetails
    .filter((detail): detail is StoreDetail => detail !== null)
    .flatMap((store) =>
      store.products
        .filter((p) => p.is_available) // Só produtos disponíveis
        .map((product) => ({
          url: `${SITE_URL}/lojas/${store.id}/produtos/${product.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        })),
    );

  // Junta tudo e retorna
  return [...staticRoutes, ...storeRoutes, ...productRoutes];
}
