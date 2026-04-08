import { MetadataRoute } from "next";

// ─── robots.ts ────────────────────────────────────────────────────────────────
//
// Este arquivo é lido automaticamente pelo Next.js e gera a URL:
//   https://vitrine-cg.com.br/robots.txt
//
// O Google (e outros buscadores) sempre acessam /robots.txt antes de
// começar a indexar um site. Ele diz ao robô:
//   - O que PODE ser indexado
//   - O que NÃO pode ser indexado
//   - Onde está o sitemap
//
// Regra geral:
//   Páginas públicas → indexar ✅
//   Páginas privadas (admin, dashboard) → bloquear 🚫
//   Páginas de autenticação → bloquear 🚫 (não faz sentido aparecer no Google)
//
export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://vitrine-cg.com.br";

  return {
    rules: [
      {
        // Aplica para todos os robôs de busca
        userAgent: "*",

        // O que PODE ser indexado
        allow: [
          "/", // home
          "/lojas", // listagem de lojas
          "/lojas/", // páginas individuais de lojas
          "/busca", // busca pública
        ],

        // O que NÃO deve ser indexado
        // Estas rotas são privadas — não faz sentido aparecerem no Google
        disallow: [
          "/admin", // painel administrativo
          "/dashboard", // painel do lojista
          "/auth/", // login e cadastro
        ],
      },
    ],

    // Informa ao Google onde está o mapa do site
    // Isso acelera muito a indexação de páginas novas
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
