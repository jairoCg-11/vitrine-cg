import Header from "@/components/layout/Header";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato e Suporte",
  description:
    "Entre em contato com a equipe da Vitrine CG. Estamos aqui para ajudar lojistas e consumidores.",
};

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <span className="badge bg-orange-100 text-orange-700 text-sm px-4 py-2 mb-4 inline-block">
            Vitrine CG
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-3 mb-3">
            Contato e Suporte
          </h1>
          <p className="text-gray-500">
            Tem dúvidas, sugestões ou precisa de ajuda? Fale com a gente!
          </p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
              📧
            </div>
            <div className="flex-1">
              <p className="font-black text-gray-900 mb-0.5">Email</p>
              <p className="text-gray-500 text-sm mb-2">
                Resposta em até 24 horas úteis.
              </p>
              <a
                href="mailto:promonamedida@gmail.com"
                className="text-orange-600 font-semibold hover:underline text-sm"
              >
                promonamedida@gmail.com
              </a>
            </div>
          </div>

          {/* Para lojistas */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="font-black text-gray-900 mb-4 text-lg">
              🏪 Para lojistas
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="text-orange-500 font-bold flex-shrink-0">
                  →
                </span>
                <p>
                  <strong>Cadastro de loja</strong> — acesse{" "}
                  <Link
                    href="/auth/register"
                    className="text-orange-600 hover:underline"
                  >
                    Cadastrar loja grátis
                  </Link>{" "}
                  e siga os passos.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 font-bold flex-shrink-0">
                  →
                </span>
                <p>
                  <strong>Aprovação</strong> — após o cadastro, sua loja passa
                  por análise. Você recebe um email quando aprovada.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 font-bold flex-shrink-0">
                  →
                </span>
                <p>
                  <strong>Upgrade de plano</strong> — entre em contato por email
                  para solicitar o plano básico ou premium.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 font-bold flex-shrink-0">
                  →
                </span>
                <p>
                  <strong>Problemas técnicos</strong> — descreva o problema por
                  email com prints se possível.
                </p>
              </div>
            </div>
          </div>

          {/* Para consumidores */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="font-black text-gray-900 mb-4 text-lg">
              🛍️ Para consumidores
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="text-orange-500 font-bold flex-shrink-0">
                  →
                </span>
                <p>
                  <strong>Compras e pagamentos</strong> — o contato é direto com
                  o lojista via WhatsApp. A Vitrine CG não realiza transações.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 font-bold flex-shrink-0">
                  →
                </span>
                <p>
                  <strong>Denúncia de conteúdo</strong> — encontrou algo
                  impróprio? Envie um email descrevendo o problema.
                </p>
              </div>
            </div>
          </div>

          {/* Links úteis */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
            <h2 className="font-black text-gray-900 mb-4">🔗 Links úteis</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="badge bg-white text-gray-700 border border-gray-200 hover:border-orange-300 transition-colors px-4 py-2"
              >
                🏪 Ver o shopping
              </Link>
              <Link
                href="/auth/register"
                className="badge bg-white text-gray-700 border border-gray-200 hover:border-orange-300 transition-colors px-4 py-2"
              >
                ✨ Cadastrar loja
              </Link>
              <Link
                href="/termos"
                className="badge bg-white text-gray-700 border border-gray-200 hover:border-orange-300 transition-colors px-4 py-2"
              >
                📋 Termos de uso
              </Link>
              <Link
                href="/auth/login"
                className="badge bg-white text-gray-700 border border-gray-200 hover:border-orange-300 transition-colors px-4 py-2"
              >
                🔑 Login do lojista
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-orange-600 font-semibold hover:underline text-sm"
          >
            ← Voltar para o shopping
          </Link>
        </div>
      </div>

      <footer className="bg-gray-900 text-white/40 py-6 px-4 text-center text-sm mt-8">
        <p>© 2026 Vitrine CG — Shopping Virtual Popular de Campina Grande</p>
      </footer>
    </div>
  );
}
