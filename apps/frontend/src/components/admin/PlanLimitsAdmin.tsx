"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PlanLimit {
  plan: string;
  max_products: number;
  label: string;
  updated_at: string;
}

const PLAN_LABELS: Record<string, string> = {
  gratis: "Grátis",
  basico: "Básico",
  premium: "Premium ⭐",
};

const PLAN_COLORS: Record<string, string> = {
  gratis: "bg-gray-100 text-gray-700",
  basico: "bg-blue-100 text-blue-700",
  premium: "bg-gradient-to-r from-orange-500 to-amber-400 text-white",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PlanLimitsAdmin() {
  const { token } = useAuth();
  const [limits, setLimits] = useState<PlanLimit[]>([]);
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchLimits();
  }, [token]);

  const fetchLimits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/plan-limits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLimits(data);
        // Inicializa o estado de edição com os valores atuais
        const initial: Record<string, number> = {};
        data.forEach((l: PlanLimit) => {
          initial[l.plan] = l.max_products;
        });
        setEditing(initial);
      }
    } catch {
      setError("Erro ao carregar limites.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (plan: string) => {
    setSaving(plan);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${API_URL}/admin/plan-limits/${plan}?max_products=${editing[plan]}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message);
        fetchLimits();
      } else {
        const data = await res.json();
        setError(data.detail || "Erro ao salvar.");
      }
    } catch {
      setError("Erro ao conectar.");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-lg font-black text-gray-900">
          ⚙️ Limite de produtos por plano
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Define quantos produtos cada plano pode ter. Use 0 para ilimitado.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm">
          ✅ {success}
        </div>
      )}

      <div className="space-y-3">
        {limits.map((limit) => (
          <div
            key={limit.plan}
            className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {/* Badge do plano */}
            <span
              className={`badge text-xs font-semibold px-3 py-1.5 flex-shrink-0 ${PLAN_COLORS[limit.plan]}`}
            >
              {PLAN_LABELS[limit.plan]}
            </span>

            {/* Input de limite */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={editing[limit.plan] ?? limit.max_products}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      [limit.plan]: Number(e.target.value),
                    })
                  }
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-center font-semibold"
                />
                <span className="text-gray-400 text-xs">
                  {editing[limit.plan] === 0 ? "= ilimitado" : "produtos"}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Atualizado em {formatDate(limit.updated_at)}
              </p>
            </div>

            {/* Botão salvar */}
            <button
              onClick={() => handleSave(limit.plan)}
              disabled={
                saving === limit.plan ||
                editing[limit.plan] === limit.max_products
              }
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {saving === limit.plan ? "Salvando..." : "Salvar"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-gray-400 text-xs mt-4 border-t border-gray-100 pt-4">
        💡 A alteração tem efeito imediato — lojistas que já estiverem no limite
        não poderão adicionar novos produtos.
      </p>
    </div>
  );
}
