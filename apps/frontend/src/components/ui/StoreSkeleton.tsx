// ─── StoreSkeleton ────────────────────────────────────────────────────────────
// Exibido enquanto a listagem de lojas está carregando.
// Usa animação pulse do Tailwind para simular o conteúdo.
// Deve ter o mesmo layout do StoreCard para evitar layout shift.

export default function StoreSkeleton() {
  return (
    <div className="card animate-pulse">
      {/* Capa */}
      <div className="h-36 bg-gray-200" />

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-gray-200 -mt-8 relative z-10 flex-shrink-0" />

          <div className="flex-1 min-w-0 mt-1 space-y-2">
            {/* Nome */}
            <div className="h-4 bg-gray-200 rounded-full w-3/4" />
            {/* Badge segmento */}
            <div className="h-3 bg-gray-200 rounded-full w-1/3" />
          </div>
        </div>

        {/* Descrição */}
        <div className="mt-3 space-y-1.5">
          <div className="h-3 bg-gray-200 rounded-full w-full" />
          <div className="h-3 bg-gray-200 rounded-full w-2/3" />
        </div>

        {/* Localização */}
        <div className="h-3 bg-gray-200 rounded-full w-1/2 mt-2" />

        {/* Botão WhatsApp */}
        <div className="h-9 bg-gray-200 rounded-xl mt-3 w-full" />
      </div>
    </div>
  );
}

// ─── Grid de skeletons ────────────────────────────────────────────────────────
// Exporta um grid pronto para usar como fallback de Suspense

export function StoreSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StoreSkeleton key={i} />
      ))}
    </div>
  );
}
