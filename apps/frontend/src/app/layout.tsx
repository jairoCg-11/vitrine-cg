import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

// ─── Metadados base ───────────────────────────────────────────────────────────
//
// Esses metadados aparecem em TODAS as páginas que não definirem os seus
// próprios. Pense neles como o "padrão do site".
//
// O campo `template` em `title` é especial: quando uma página define seu
// próprio título, o Next.js substitui automaticamente o %s pelo título
// daquela página e mantém o " | Vitrine CG" no final.
//
// Exemplo: página da loja define title: "Moda Feminina Ana"
// Google vai ver: "Moda Feminina Ana | Vitrine CG"
//
export const metadata: Metadata = {
  title: {
    // Título padrão (home e páginas sem título próprio)
    default: "Vitrine CG — Shopping Virtual Popular de Campina Grande",
    // Template aplicado automaticamente nas páginas filhas
    template: "%s | Vitrine CG",
  },

  description:
    "Compre roupas, calçados, eletrônicos e muito mais direto com os lojistas " +
    "do shopping popular de Campina Grande – PB. Atendimento personalizado via WhatsApp.",

  // Palavras-chave — ajudam na indexação local
  keywords: [
    "shopping campina grande",
    "lojistas campina grande",
    "comprar campina grande",
    "marketplace campina grande",
    "vitrine cg",
    "shopping popular campina grande",
    "lojas campina grande",
    "produtos campina grande",
    "feira campina grande",
    "comércio campina grande paraíba",
  ],

  authors: [{ name: "Vitrine CG" }],
  creator: "Vitrine CG",

  // metadataBase é obrigatório para URLs absolutas funcionarem
  // Troque pelo domínio real em produção
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://vitrine-cg.com.br",
  ),

  // ── Open Graph ────────────────────────────────────────────────────────────
  // Define como o link aparece quando compartilhado no WhatsApp, Facebook,
  // Telegram etc. Sem isso, o preview fica feio ou em branco.
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://vitrine-cg.com.br",
    siteName: "Vitrine CG",
    title: "Vitrine CG — Shopping Virtual Popular de Campina Grande",
    description:
      "Compre direto com os lojistas do shopping popular de Campina Grande via WhatsApp.",
  },

  // ── Robots ────────────────────────────────────────────────────────────────
  // index: true  → Google pode indexar a página
  // follow: true → Google pode seguir os links da página
  // O robots.ts que criaremos vai complementar isso com regras mais finas
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
