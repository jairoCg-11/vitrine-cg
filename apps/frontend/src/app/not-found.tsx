// apps/frontend/src/app/not-found.tsx
//
// Este arquivo é reconhecido automaticamente pelo Next.js.
// Sempre que qualquer rota retornar notFound() ou o usuário
// acessar uma URL que não existe, esta página é exibida.
//
// Boas práticas de SEO para páginas 404:
//  - Não deixar o usuário perdido: oferecer caminhos claros de volta
//  - Não indexar a página (o Next.js já retorna status 404 automaticamente,
//    o que diz ao Google para não indexar)
//
import Link from "next/link";
import Header from "@/components/layout/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-8xl mb-6">🔍</p>

        <h1 className="text-4xl font-black text-gray-900 mb-3">
          Página não encontrada
        </h1>

        <p className="text-gray-500 text-lg mb-10">
          O endereço que você acessou não existe ou foi removido. Mas tem muita
          coisa boa te esperando aqui!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary px-8 py-3 text-center">
            Ir para o início
          </Link>
          <Link
            href="/lojas"
            className="border border-gray-200 bg-white text-gray-700 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-all text-center"
          >
            Ver todas as lojas
          </Link>
        </div>
      </div>
    </div>
  );
}
