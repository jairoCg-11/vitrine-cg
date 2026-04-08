"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminStore {
  id: number;
  name: string;
  plan: "gratis" | "basico" | "premium";
  owner_id: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleBadge(role: string): string {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-700";
    case "lojista":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function roleLabel(role: string): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "lojista":
      return "Lojista";
    default:
      return "Consumidor";
  }
}

function planBadge(plan: string): string {
  switch (plan) {
    case "premium":
      return "bg-gradient-to-r from-orange-500 to-amber-400 text-white";
    case "basico":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function planLabel(plan: string): string {
  switch (plan) {
    case "premium":
      return "⭐ Premium";
    case "basico":
      return "Básico";
    default:
      return "Grátis";
  }
}

function nextPlan(plan: string): "gratis" | "basico" | "premium" {
  switch (plan) {
    case "gratis":
      return "basico";
    case "basico":
      return "premium";
    default:
      return "gratis";
  }
}

function nextPlanLabel(plan: string): string {
  switch (plan) {
    case "gratis":
      return "→ Básico";
    case "basico":
      return "→ Premium";
    default:
      return "→ Grátis";
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Proteção de rota
  useEffect(() => {
    if (isLoading) return;
    if (!token || user?.role !== "admin") router.push("/");
  }, [isLoading, token, user, router]);

  // Carrega usuários e lojas em paralelo
  useEffect(() => {
    if (token && user?.role === "admin") fetchData();
  }, [token, user]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [usersRes, storesRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/public/stores`),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (storesRes.ok) setStores(await storesRes.json());
    } catch {
      setError("Erro ao carregar dados.");
    } finally {
      setLoadingData(false);
    }
  };

  // Retorna a loja de um lojista (se tiver)
  const getStoreByOwner = (ownerId: number): AdminStore | undefined =>
    stores.find((s) => s.owner_id === ownerId);

  // Bloqueia / desbloqueia usuário
  const handleToggleBlock = async (target: AdminUser) => {
    const action = target.is_active ? "bloquear" : "desbloquear";
    if (!confirm(`Deseja ${action} "${target.name}"?`)) return;

    setActionLoading(target.id);
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/users/${target.id}/block`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === target.id ? { ...u, is_active: !u.is_active } : u,
          ),
        );
      } else {
        const data = await res.json();
        setError(data.detail || "Erro ao alterar usuário.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setActionLoading(null);
    }
  };

  // Exclui usuário
  const handleDelete = async (target: AdminUser) => {
    if (
      !confirm(
        `Excluir permanentemente "${target.name}"?\n\nEsta ação não pode ser desfeita.`,
      )
    )
      return;

    setActionLoading(target.id);
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/users/${target.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 204) {
        setUsers((prev) => prev.filter((u) => u.id !== target.id));
      } else {
        const data = await res.json();
        setError(data.detail || "Erro ao excluir usuário.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setActionLoading(null);
    }
  };

  // Avança o plano da loja para o próximo nível
  const handleChangePlan = async (store: AdminStore) => {
    const next = nextPlan(store.plan);
    if (!confirm(`Alterar plano de "${store.name}" para "${next}"?`)) return;

    setActionLoading(store.owner_id);
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/stores/${store.id}/plan`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: next }),
      });
      if (res.ok) {
        setStores((prev) =>
          prev.map((s) => (s.id === store.id ? { ...s, plan: next } : s)),
        );
      } else {
        const data = await res.json();
        setError(data.detail || "Erro ao alterar plano.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const metrics = {
    total: users.length,
    lojistas: users.filter((u) => u.role === "lojista").length,
    admins: users.filter((u) => u.role === "admin").length,
    bloqueados: users.filter((u) => !u.is_active).length,
    premium: stores.filter((s) => s.plan === "premium").length,
  };

  if (isLoading || (loadingData && users.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-shopping-dark text-white px-4 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center font-black">
              A
            </div>
            <div>
              <p className="font-black leading-none">Vitrine CG</p>
              <p className="text-purple-400 text-xs leading-none">
                Painel Administrativo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/70 text-sm hidden md:block">
              {user.name.split(" ")[0]}
            </span>
            <Link
              href="/"
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Ver shopping
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Título ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">
            Gestão de Usuários
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie usuários e planos das lojas da plataforma.
          </p>
        </div>

        {/* ── Métricas ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-5 text-center">
            <p className="text-3xl font-black text-gray-900">{metrics.total}</p>
            <p className="text-gray-500 text-sm mt-1">Total</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5 text-center">
            <p className="text-3xl font-black text-orange-500">
              {metrics.lojistas}
            </p>
            <p className="text-gray-500 text-sm mt-1">Lojistas</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5 text-center">
            <p className="text-3xl font-black text-purple-500">
              {metrics.admins}
            </p>
            <p className="text-gray-500 text-sm mt-1">Admins</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5 text-center">
            <p className="text-3xl font-black text-red-500">
              {metrics.bloqueados}
            </p>
            <p className="text-gray-500 text-sm mt-1">Bloqueados</p>
          </div>
          {/* Métrica de lojas premium — novo */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl shadow-md p-5 text-center col-span-2 md:col-span-1">
            <p className="text-3xl font-black text-white">{metrics.premium}</p>
            <p className="text-white/80 text-sm mt-1">⭐ Premium</p>
          </div>
        </div>

        {/* ── Erro ───────────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* ── Tabela ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md">
          {/* Busca */}
          <div className="p-6 border-b border-gray-100">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            {search && (
              <p className="text-xs text-gray-400 mt-2">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}{" "}
                encontrado{filtered.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="py-3 px-6 font-semibold text-gray-600">
                    Usuário
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600">
                    Perfil
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600">
                    Plano da Loja
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600 hidden md:table-cell">
                    Cadastro
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-600 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400">
                      {search
                        ? "Nenhum usuário encontrado."
                        : "Nenhum usuário cadastrado."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const isCurrentUser = u.id === user.id;
                    const isBusy = actionLoading === u.id;
                    const store =
                      u.role === "lojista" ? getStoreByOwner(u.id) : undefined;

                    return (
                      <tr
                        key={u.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        {/* Nome + email */}
                        <td className="py-4 px-6">
                          <p className="font-semibold text-gray-900">
                            {u.name}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {u.email}
                          </p>
                          {u.phone && (
                            <p className="text-gray-400 text-xs">{u.phone}</p>
                          )}
                        </td>

                        {/* Perfil */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge(u.role)}`}
                          >
                            {roleLabel(u.role)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                              u.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {u.is_active ? "● Ativo" : "● Bloqueado"}
                          </span>
                        </td>

                        {/* Plano da loja */}
                        <td className="py-4 px-4">
                          {store ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${planBadge(store.plan)}`}
                              >
                                {planLabel(store.plan)}
                              </span>
                              <button
                                onClick={() => handleChangePlan(store)}
                                disabled={isBusy}
                                className="text-xs text-gray-400 hover:text-orange-600 font-semibold transition-colors disabled:opacity-40"
                                title="Avançar plano"
                              >
                                {isBusy ? "..." : nextPlanLabel(store.plan)}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Data de cadastro */}
                        <td className="py-4 px-4 text-gray-500 hidden md:table-cell">
                          {formatDate(u.created_at)}
                        </td>

                        {/* Ações */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            {isCurrentUser ? (
                              <span className="text-xs text-gray-400 italic">
                                você
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleToggleBlock(u)}
                                  disabled={isBusy}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                                    u.is_active
                                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                      : "bg-green-100 text-green-700 hover:bg-green-200"
                                  }`}
                                >
                                  {isBusy
                                    ? "..."
                                    : u.is_active
                                      ? "Bloquear"
                                      : "Desbloquear"}
                                </button>
                                <button
                                  onClick={() => handleDelete(u)}
                                  disabled={isBusy}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-all disabled:opacity-50"
                                >
                                  {isBusy ? "..." : "Excluir"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
              {filtered.length} usuário{filtered.length !== 1 ? "s" : ""}{" "}
              exibido{filtered.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
