import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vitrine CG — Shopping Virtual Popular de Campina Grande",
    template: "%s | Vitrine CG",
  },
  description:
    "Compre roupas, calçados, eletrônicos e muito mais direto com os lojistas " +
    "do shopping popular de Campina Grande – PB. Atendimento personalizado via WhatsApp.",
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://vitrine-cg.com.br",
  ),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://vitrine-cg.com.br",
    siteName: "Vitrine CG",
    title: "Vitrine CG — Shopping Virtual Popular de Campina Grande",
    description:
      "Compre direto com os lojistas do shopping popular de Campina Grande via WhatsApp.",
  },
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
    <html lang="pt-BR" className={`h-full ${syne.variable} ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
