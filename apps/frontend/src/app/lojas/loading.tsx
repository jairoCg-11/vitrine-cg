// ─── loading.tsx ──────────────────────────────────────────────────────────────
// O Next.js exibe este arquivo automaticamente enquanto a página /lojas
// está sendo carregada (Server Component buscando dados da API).
// Não precisa de "use client".

import { StoreSkeletonGrid } from "@/components/ui/StoreSkeleton";

export default function LojasLoading() {
  return (
    <div className="min-h-screen">
      {/* Header placeholder */}
      <div className="h-16 bg-shopping-dark" />

      {/* Hero placeholder */}
      <div className="bg-gradient-to-r from-shopping-dark to-shopping-medium py-12 px-4">
        <div className="max-w-7xl mx-auto animate-pulse space-y-3">
          <div className="h-8 bg-white/10 rounded-xl w-48" />
          <div className="h-4 bg-white/10 rounded-xl w-32" />
        </div>
      </div>

      {/* Filtros placeholder */}
      <div className="bg-white border-b py-4 px-4">
        <div className="max-w-7xl mx-auto flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-gray-200 rounded-full animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Grid de lojas */}
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <StoreSkeletonGrid count={8} />
        </div>
      </div>
    </div>
  );
}
