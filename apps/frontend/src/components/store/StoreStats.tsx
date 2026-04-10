"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PeriodStats {
  views: number;
  whatsapp_clicks: number;
}

interface Stats {
  "7d": PeriodStats;
  "30d": PeriodStats;
  "90d": PeriodStats;
}

export default function StoreStats() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/stores/me/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded-full w-32 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const current = stats[period];

  const conversionRate =
    current.views > 0
      ? ((current.whatsapp_clicks / current.views) * 100).toFixed(1)
      : "0.0";

  const periodLabel = {
    "7d": "últimos 7 dias",
    "30d": "últimos 30 dias",
    "90d": "últimos 90 dias",
  }[period];

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-black text-gray-900">
            📊 Estatísticas
          </h2>
          <p className="text-gray-400 text-xs mt-0.5 capitalize">
            {periodLabel}
          </p>
        </div>

        {/* Seletor de período */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-3 gap-3">
        {/* Visitas */}
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-2xl md:text-3xl font-black text-blue-600">
            {current.views.toLocaleString("pt-BR")}
          </p>
          <p className="text-blue-500 text-xs font-semibold mt-1">👁️ Visitas</p>
        </div>

        {/* Cliques WhatsApp */}
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-2xl md:text-3xl font-black text-green-600">
            {current.whatsapp_clicks.toLocaleString("pt-BR")}
          </p>
          <p className="text-green-500 text-xs font-semibold mt-1">
            💬 WhatsApp
          </p>
        </div>

        {/* Taxa de conversão */}
        <div className="bg-orange-50 rounded-2xl p-4 text-center">
          <p className="text-2xl md:text-3xl font-black text-orange-600">
            {conversionRate}%
          </p>
          <p className="text-orange-500 text-xs font-semibold mt-1">
            🎯 Conversão
          </p>
        </div>
      </div>

      {/* Dica */}
      {current.views === 0 && (
        <p className="text-gray-400 text-xs text-center mt-3">
          As estatísticas aparecem assim que alguém visitar sua loja.
        </p>
      )}
      {current.views > 0 && current.whatsapp_clicks === 0 && (
        <p className="text-gray-400 text-xs text-center mt-3">
          💡 Dica: adicione boas fotos e descrições para aumentar os contatos
          via WhatsApp.
        </p>
      )}
    </div>
  );
}
