"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PendingStore {
  id: number;
  name: string;
  segment: string | null;
  owner_id: number;
  is_approved: boolean;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function PendingStores() {
  const { token } = useAuth();
  const [stores, setStores] = useState<PendingStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (token) fetchPending();
  }, [token]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/stores/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStores(await res.json());
    } catch {
      setError("Erro ao carregar lojas pendentes.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (store: PendingStore, approve: boolean) => {
    const action = approve ? "aprovar" : "rejeitar";
    if (!confirm(`Deseja ${action} a loja "${store.name}"?`)) return;

    setActionId(store.id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/admin/stores/${store.id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message);
        // Remove da lista de pendentes se aprovada, mantém se rejeitada
        if (approve) {
          setStores((prev) => prev.filter((s) => s.id !== store.id));
        } else {
          setStores((prev) =>
            prev.map((s) =>
              s.id === store.id ? { ...s, is_approved: false } : s,
            ),
          );
        }
      } else {
        setError("Erro ao processar ação.");
      }
    } catch {
      setError("Erro ao conectar.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✅ {success}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">
            Lojas aguardando aprovação
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {stores.length === 0
              ? "Nenhuma loja pendente"
              : `${stores.length} loja${stores.length !== 1 ? "s" : ""} aguardando análise`}
          </p>
        </div>

        {stores.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-400">Todas as lojas foram analisadas.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stores.map((store) => (
              <div
                key={store.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Inicial da loja */}
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black flex-shrink-0">
                  {store.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {store.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {store.segment && (
                      <span className="badge bg-orange-100 text-orange-700 text-xs capitalize">
                        {store.segment}
                      </span>
                    )}
                    <span className="text-gray-400 text-xs">
                      Cadastrada em {formatDate(store.created_at)}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(store, true)}
                    disabled={actionId === store.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-all disabled:opacity-50"
                  >
                    {actionId === store.id ? "..." : "✅ Aprovar"}
                  </button>
                  <button
                    onClick={() => handleApprove(store, false)}
                    disabled={actionId === store.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-all disabled:opacity-50"
                  >
                    {actionId === store.id ? "..." : "❌ Rejeitar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
