"use client";

import Link from "next/link";

interface Props {
  storeName: string;
}

// ─── PendingStoreBanner ───────────────────────────────────────────────────────
// Exibido no dashboard do lojista quando a loja ainda não foi aprovada pelo admin.
// Desaparece automaticamente quando is_approved = true.

export default function PendingStoreBanner({ storeName }: Props) {
  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">⏳</span>
        <div className="flex-1">
          <p className="font-black text-amber-800 text-sm">
            Sua loja está aguardando aprovação
          </p>
          <p className="text-amber-700 text-xs mt-1 leading-relaxed">
            A loja <strong>"{storeName}"</strong> foi cadastrada com sucesso e
            está em análise pela nossa equipe. Assim que aprovada, ela ficará
            visível para todos os clientes do Vitrine CG.
          </p>
          <p className="text-amber-600 text-xs mt-2">
            💡 Enquanto aguarda, você já pode cadastrar seus produtos e
            adicionar fotos!
          </p>
        </div>
      </div>
    </div>
  );
}
