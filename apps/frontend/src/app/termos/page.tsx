import Header from "@/components/layout/Header";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de uso e política da plataforma Vitrine CG — Shopping Virtual Popular de Campina Grande.",
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <span className="badge bg-orange-100 text-orange-700 text-sm px-4 py-2 mb-4 inline-block">
            Vitrine CG
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-3 mb-3">
            Termos de Uso
          </h1>
          <p className="text-gray-500 text-sm">
            Última atualização: maio de 2026
          </p>
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              1. Sobre a plataforma
            </h2>
            <p>
              A <strong>Vitrine CG</strong> é um shopping virtual que conecta
              lojistas do Shopping Popular de Campina Grande – PB com
              consumidores locais. A plataforma oferece espaço digital para que
              lojistas divulguem seus produtos e serviços, facilitando o contato
              direto com clientes via WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              2. Responsabilidade do lojista
            </h2>
            <p className="mb-3">
              Ao cadastrar sua loja na Vitrine CG, o lojista assume total e
              integral responsabilidade por todo o conteúdo publicado,
              incluindo:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-500 ml-2">
              <li>Fotos, descrições e preços dos produtos</li>
              <li>Informações de contato e localização</li>
              <li>Qualquer outro material inserido na plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              3. Papel da plataforma
            </h2>
            <p>
              A Vitrine CG atua exclusivamente como intermediária, cedendo
              espaço digital para divulgação. A plataforma{" "}
              <strong>não se responsabiliza</strong> por negociações, qualidade
              dos produtos, preços praticados ou quaisquer relações comerciais
              entre lojistas e consumidores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              4. Conteúdo proibido
            </h2>
            <p className="mb-3">
              É expressamente proibido publicar conteúdo que:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-500 ml-2">
              <li>Seja falso, enganoso ou fraudulento</li>
              <li>Viole direitos autorais ou de propriedade intelectual</li>
              <li>Seja ofensivo, discriminatório ou ilegal</li>
              <li>Divulgue produtos ou serviços proibidos por lei</li>
              <li>Contenha informações de terceiros sem autorização</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              5. Moderação de conteúdo
            </h2>
            <p>
              A administração da Vitrine CG reserva-se o direito de remover
              qualquer conteúdo que viole estes termos, sem aviso prévio,
              incluindo a suspensão ou exclusão da loja. Novas lojas passam por
              aprovação antes de serem exibidas publicamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              6. Planos e limites
            </h2>
            <p>
              A plataforma oferece planos gratuito, básico e premium com
              diferentes limites de produtos. Os limites podem ser ajustados
              pela administração. O upgrade de plano deve ser solicitado
              diretamente ao suporte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              7. Registro de aceite
            </h2>
            <p>
              Ao aceitar estes termos no momento do cadastro, o endereço IP,
              data e hora são registrados como comprovante do aceite, podendo
              ser utilizados para fins jurídicos caso necessário.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              8. Privacidade
            </h2>
            <p>
              Os dados cadastrais dos lojistas são utilizados exclusivamente
              para operação da plataforma e não são compartilhados com
              terceiros. As estatísticas de visitas são anônimas e agregadas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              9. Alterações nos termos
            </h2>
            <p>
              Estes termos podem ser atualizados a qualquer momento. O uso
              contínuo da plataforma após alterações implica na aceitação dos
              novos termos. Alterações significativas serão comunicadas por
              email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              10. Contato e suporte
            </h2>
            <p>
              Dúvidas, solicitações ou denúncias de conteúdo podem ser enviadas
              para:
            </p>
            <a
              href="mailto:promonamedida@gmail.com"
              className="inline-flex items-center gap-2 mt-3 text-orange-600 font-semibold hover:underline"
            >
              📧 promonamedida@gmail.com
            </a>
          </section>
        </div>

        {/* Rodapé da página */}
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
