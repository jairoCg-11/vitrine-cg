"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const REFRESH_INTERVAL = 30000; // 30 segundos

interface Analytics {
  online: number;
  today_views: number;
  total_views: number;
  whatsapp_today: number;
  whatsapp_total: number;
  top_store_today: { id: number; name: string; visits: number } | null;
  updated_at: string;
}

export default function GlobalAnalytics() {
  const { token } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      }
    } catch {
      console.error("Erro ao buscar analytics.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-gray-900">
          🌐 Métricas da Plataforma
        </h2>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            Ao vivo · {lastUpdate}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Online agora */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            <span className="text-xs text-green-600 font-semibold">Online</span>
          </div>
          <p className="text-3xl font-black text-green-600">{data.online}</p>
          <p className="text-green-500 text-xs mt-1">últimos 5min</p>
        </div>

        {/* Visitas hoje */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-blue-600 font-semibold mb-1">👁️ Hoje</p>
          <p className="text-3xl font-black text-blue-600">
            {data.today_views}
          </p>
          <p className="text-blue-500 text-xs mt-1">visitas</p>
        </div>

        {/* Total visitas */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-purple-600 font-semibold mb-1">📊 Total</p>
          <p className="text-3xl font-black text-purple-600">
            {data.total_views.toLocaleString("pt-BR")}
          </p>
          <p className="text-purple-500 text-xs mt-1">visitas</p>
        </div>

        {/* WhatsApp hoje */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-emerald-600 font-semibold mb-1">
            💬 WhatsApp
          </p>
          <p className="text-3xl font-black text-emerald-600">
            {data.whatsapp_today}
          </p>
          <p className="text-emerald-500 text-xs mt-1">hoje</p>
        </div>

        {/* WhatsApp total */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-orange-600 font-semibold mb-1">
            💬 Total WA
          </p>
          <p className="text-3xl font-black text-orange-600">
            {data.whatsapp_total.toLocaleString("pt-BR")}
          </p>
          <p className="text-orange-500 text-xs mt-1">cliques</p>
        </div>
      </div>

      {/* Loja mais visitada hoje */}
      {data.top_store_today && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-xs text-gray-400">Loja mais visitada hoje</p>
            <p className="text-sm font-bold text-gray-900">
              {data.top_store_today.name}
              <span className="text-orange-500 font-normal ml-2">
                {data.top_store_today.visits} visitas
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
