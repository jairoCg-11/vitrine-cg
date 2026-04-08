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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Proteção de rota — apenas admins
  useEffect(() => {
    if (isLoading) return;
    if (!token || user?.role !== "admin") {
      router.push("/");
    }
  }, [isLoading, token, user, router]);

  // Carrega usuários
  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchUsers();
    }
  }, [token, user]);

  const fetchUsers = async () => {
    setLoadingData(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(await res.json());
      } else {
        setError("Erro ao carregar usuários.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoadingData(false);
    }
  };

  // Bloqueia ou desbloqueia um usuário
  const handleToggleBlock = async (targetUser: AdminUser) => {
    const action = targetUser.is_active ? "bloquear" : "desbloquear";
    if (!confirm(`Deseja ${action} o usuário "${targetUser.name}"?`)) return;

    setActionLoading(targetUser.id);
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/users/${targetUser.id}/block`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Atualiza estado local sem reload
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, is_active: !u.is_active } : u,
          ),
        );
      } else {
        const data = await res.json();
        setError(data.detail || `Erro ao ${action} usuário.`);
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setActionLoading(null);
    }
  };

  // Exclui permanentemente um usuário
  const handleDelete = async (targetUser: AdminUser) => {
    if (
      !confirm(
        `Excluir permanentemente "${targetUser.name}"?\n\nEsta ação não pode ser desfeita.`,
      )
    )
      return;

    setActionLoading(targetUser.id);
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/users/${targetUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 204) {
        // Remove da lista local
        setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
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

  // Filtro client-side por nome ou email
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  // Métricas calculadas a partir da lista
  const metrics = {
    total: users.length,
    lojistas: users.filter((u) => u.role === "lojista").length,
    admins: users.filter((u) => u.role === "admin").length,
    bloqueados: users.filter((u) => !u.is_active).length,
  };

  // Estados de carregamento / acesso negado
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
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="bg-shopping-dark text-white px-4 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center font-black text-white">
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
        {/* ── Título ────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">
            Gestão de Usuários
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie todos os usuários cadastrados na plataforma.
          </p>
        </div>

        {/* ── Métricas ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        </div>

        {/* ── Erro global ───────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* ── Busca + Tabela ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md">
          {/* Campo de busca */}
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

          {/* Tabela desktop */}
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
                    <td colSpan={5} className="py-16 text-center text-gray-400">
                      {search
                        ? "Nenhum usuário encontrado."
                        : "Nenhum usuário cadastrado."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const isCurrentUser = u.id === user.id;
                    const isBusy = actionLoading === u.id;

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

                        {/* Data de cadastro */}
                        <td className="py-4 px-4 text-gray-500 hidden md:table-cell">
                          {formatDate(u.created_at)}
                        </td>

                        {/* Ações */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* Não permite ações no próprio admin logado */}
                            {isCurrentUser ? (
                              <span className="text-xs text-gray-400 italic">
                                você
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleToggleBlock(u)}
                                  disabled={isBusy}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
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
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Rodapé da tabela */}
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
