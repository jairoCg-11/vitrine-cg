// ─── ProductSkeleton ──────────────────────────────────────────────────────────
// Exibido enquanto os produtos estão carregando.
// Mesmo layout do ProductCard para evitar layout shift.

export default function ProductSkeleton() {
  return (
    <div className="card animate-pulse">
      {/* Imagem */}
      <div className="h-40 bg-gray-200" />

      {/* Info */}
      <div className="p-3 space-y-2">
        {/* Nome */}
        <div className="h-3.5 bg-gray-200 rounded-full w-full" />
        <div className="h-3.5 bg-gray-200 rounded-full w-3/4" />

        {/* Descrição */}
        <div className="h-3 bg-gray-200 rounded-full w-full" />
        <div className="h-3 bg-gray-200 rounded-full w-2/3" />

        {/* Tamanhos */}
        <div className="flex gap-1 pt-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-5 w-7 bg-gray-200 rounded" />
          ))}
        </div>

        {/* Preço */}
        <div className="h-5 bg-gray-200 rounded-full w-1/3" />

        {/* Botão */}
        <div className="h-8 bg-gray-200 rounded-xl w-full mt-1" />
      </div>
    </div>
  );
}

// ─── Grid de skeletons ────────────────────────────────────────────────────────

export function ProductSkeletonGrid({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
