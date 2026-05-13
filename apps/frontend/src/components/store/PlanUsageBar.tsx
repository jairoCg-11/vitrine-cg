"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PlanLimit {
  plan: string;
  max_products: number;
  label: string;
}

interface Props {
  currentProducts: number;
  plan: "gratis" | "basico" | "premium";
}

export default function PlanUsageBar({ currentProducts, plan }: Props) {
  const { token } = useAuth();
  const [limit, setLimit] = useState<PlanLimit | null>(null);

  useEffect(() => {
    // Busca o limite do plano atual
    fetch(`${API_URL}/public/plan-limits`)
      .then((res) => res.json())
      .catch(() => null)
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((l: PlanLimit) => l.plan === plan);
          if (found) setLimit(found);
        }
      });
  }, [plan]);

  // Premium — ilimitado, não exibe barra
  if (!limit || limit.max_products === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
        <span className="badge bg-gradient-to-r from-orange-500 to-amber-400 text-white text-xs">
          ⭐ Premium
        </span>
        <span>Produtos ilimitados</span>
      </div>
    );
  }

  const percentage = Math.min(
    (currentProducts / limit.max_products) * 100,
    100,
  );
  const remaining = limit.max_products - currentProducts;
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentProducts >= limit.max_products;

  return (
    <div className="mt-2">
      {/* Texto de uso */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">
          {currentProducts} de {limit.max_products} produtos usados
        </span>
        {isAtLimit ? (
          <span className="text-xs font-semibold text-red-600">
            Limite atingido
          </span>
        ) : isNearLimit ? (
          <span className="text-xs font-semibold text-amber-600">
            {remaining} restantes
          </span>
        ) : (
          <span className="text-xs text-gray-400">{remaining} restantes</span>
        )}
      </div>

      {/* Barra de progresso */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAtLimit
              ? "bg-red-500"
              : isNearLimit
                ? "bg-amber-400"
                : "bg-orange-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* CTA de upgrade quando perto ou no limite */}
      {isNearLimit && (
        <div
          className={`mt-2 rounded-xl px-3 py-2 text-xs flex items-center justify-between ${
            isAtLimit
              ? "bg-red-50 border border-red-200"
              : "bg-amber-50 border border-amber-200"
          }`}
        >
          <span className={isAtLimit ? "text-red-700" : "text-amber-700"}>
            {isAtLimit
              ? "⛔ Você atingiu o limite do plano. Faça upgrade para continuar adicionando produtos."
              : `⚠️ Quase no limite! Faça upgrade para adicionar mais produtos.`}
          </span>
        </div>
      )}
    </div>
  );
}
