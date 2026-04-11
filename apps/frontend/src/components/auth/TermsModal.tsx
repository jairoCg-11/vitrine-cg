"use client";

interface Props {
  onAccept: () => void;
  onReject: () => void;
}

export default function TermsModal({ onAccept, onReject }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onReject} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-black text-gray-900">
            📋 Termos de Uso — Vitrine CG
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Leia com atenção antes de continuar
          </p>
        </div>

        {/* Conteúdo rolável */}
        <div className="px-6 py-4 overflow-y-auto flex-1 text-sm text-gray-600 space-y-4 leading-relaxed">
          <div>
            <p className="font-bold text-gray-800 mb-1">
              1. Responsabilidade do Lojista
            </p>
            <p>
              Ao cadastrar sua loja na Vitrine CG, você assume total e integral
              responsabilidade por todo o conteúdo publicado, incluindo fotos,
              descrições, preços, informações de contato e qualquer outro
              material inserido na plataforma.
            </p>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-1">
              2. Papel da Plataforma
            </p>
            <p>
              A Vitrine CG atua exclusivamente como intermediária, cedendo
              espaço digital para que lojistas divulguem seus produtos e
              serviços. A plataforma não se responsabiliza por negociações,
              qualidade dos produtos, preços praticados ou quaisquer relações
              comerciais entre lojistas e consumidores.
            </p>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-1">3. Conteúdo Proibido</p>
            <p>É expressamente proibido publicar conteúdo que:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-500">
              <li>Seja falso, enganoso ou fraudulento</li>
              <li>Viole direitos autorais ou de propriedade intelectual</li>
              <li>Seja ofensivo, discriminatório ou ilegal</li>
              <li>Divulgue produtos ou serviços proibidos por lei</li>
              <li>Contenha informações de terceiros sem autorização</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-1">
              4. Moderação de Conteúdo
            </p>
            <p>
              A administração da Vitrine CG reserva-se o direito de remover
              qualquer conteúdo que viole estes termos, sem aviso prévio e sem
              necessidade de justificativa, incluindo a suspensão ou exclusão da
              loja.
            </p>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-1">
              5. Veracidade das Informações
            </p>
            <p>
              O lojista declara que todas as informações cadastradas são
              verdadeiras, que possui autorização para comercializar os produtos
              listados e que os preços divulgados são praticados de boa-fé.
            </p>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-1">
              6. Registro de Aceite
            </p>
            <p>
              Ao aceitar estes termos, seu endereço IP, data e hora serão
              registrados como comprovante do aceite, podendo ser utilizados
              para fins jurídicos caso necessário.
            </p>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-1">
              7. Alterações nos Termos
            </p>
            <p>
              Estes termos podem ser atualizados a qualquer momento. O uso
              contínuo da plataforma após alterações implica na aceitação dos
              novos termos.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <p className="text-orange-700 font-semibold text-xs">
              ⚠️ Ao aceitar, você confirma que leu, entendeu e concorda com
              todos os termos acima, assumindo total responsabilidade pelo
              conteúdo publicado em sua loja.
            </p>
          </div>
        </div>

        {/* Footer com botões */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-all text-sm"
          >
            Não aceitar
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black transition-all text-sm"
          >
            Li e aceito os termos →
          </button>
        </div>
      </div>
    </div>
  );
}
