"use client";

import { useEffect } from "react";
import Link from "next/link";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

// ─── error.tsx ────────────────────────────────────────────────────────────────
// Captura erros inesperados em qualquer página do app.
// O Next.js exibe este componente automaticamente quando ocorre um erro
// não tratado durante a renderização.
// Precisa de "use client" pois usa o hook useEffect.

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Em produção, aqui entraría o Sentry ou similar
    console.error("Erro global:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-7xl mb-6">⚠️</p>

        <h1 className="text-2xl font-black text-gray-900 mb-3">
          Algo deu errado
        </h1>

        <p className="text-gray-500 mb-8">
          Ocorreu um erro inesperado. Tente novamente ou volte para o início.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary px-6 py-3">
            Tentar novamente
          </button>
          <Link
            href="/"
            className="border border-gray-200 bg-white text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all text-center"
          >
            Voltar ao início
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left bg-red-50 border border-red-200 rounded-xl p-4">
            <summary className="text-red-700 font-semibold text-sm cursor-pointer">
              Detalhes do erro (dev)
            </summary>
            <pre className="text-red-600 text-xs mt-2 overflow-auto whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
