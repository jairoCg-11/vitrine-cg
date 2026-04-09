// ─── loading.tsx ──────────────────────────────────────────────────────────────
// Exibido enquanto a página /lojas/[id] carrega os dados da loja.

import { ProductSkeletonGrid } from "@/components/ui/ProductSkeleton";

export default function StoreLoading() {
  return (
    <div className="min-h-screen">
      {/* Header placeholder */}
      <div className="h-16 bg-shopping-dark" />

      {/* Capa skeleton */}
      <div className="h-48 md:h-72 bg-gray-200 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4">
        {/* Card info skeleton */}
        <div className="relative -mt-10 md:-mt-14 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 animate-pulse">
            <div className="flex items-start gap-3 md:gap-5">
              {/* Logo */}
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gray-200 -mt-8 md:-mt-10 flex-shrink-0" />

              <div className="flex-1 space-y-2 pt-1">
                <div className="h-6 bg-gray-200 rounded-full w-48" />
                <div className="h-4 bg-gray-200 rounded-full w-24" />
                <div className="h-3 bg-gray-200 rounded-full w-full" />
                <div className="h-3 bg-gray-200 rounded-full w-3/4" />
                <div className="flex gap-4 pt-2">
                  <div className="h-4 bg-gray-200 rounded-full w-16" />
                  <div className="h-4 bg-gray-200 rounded-full w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Título produtos */}
        <div className="h-6 bg-gray-200 rounded-full w-40 animate-pulse mb-4" />

        {/* Grid produtos */}
        <ProductSkeletonGrid count={5} />
      </div>
    </div>
  );
}
