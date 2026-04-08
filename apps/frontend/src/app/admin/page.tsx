"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
}

interface AdminStore {
  id: number;
  name: string;
  plan: "gratis" | "basico" | "premium";
  owner_id: number;
}

interface Banner {
  id: number;
  image_url: string;
  link_url: string | null;
  title: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleBadge(role: string) {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-700";
    case "lojista":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
function roleLabel(role: string) {
  switch (role) {
    case "admin":
      return "Admin";
    case "lojista":
      return "Lojista";
    default:
      return "Consumidor";
  }
}
function planBadge(plan: string) {
  switch (plan) {
    case "premium":
      return "bg-gradient-to-r from-orange-500 to-amber-400 text-white";
    case "basico":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
}
function planLabel(plan: string) {
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
function nextPlanLabel(plan: string) {
  switch (plan) {
    case "gratis":
      return "→ Básico";
    case "basico":
      return "→ Premium";
    default:
      return "→ Grátis";
  }
}
function formatDate(iso: string) {
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

  // Aba ativa: "usuarios" | "banners"
  const [activeTab, setActiveTab] = useState<"usuarios" | "banners">(
    "usuarios",
  );

  // ── Estado: usuários ──
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ── Estado: banners ──
  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerForm, setBannerForm] = useState({ title: "", link_url: "" });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Proteção de rota
  useEffect(() => {
    if (isLoading) return;
    if (!token || user?.role !== "admin") router.push("/");
  }, [isLoading, token, user, router]);

  // Carrega dados
  useEffect(() => {
    if (token && user?.role === "admin") fetchData();
  }, [token, user]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [usersRes, storesRes, bannersRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/public/stores`),
        fetch(`${API_URL}/admin/banners`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (storesRes.ok) setStores(await storesRes.json());
      if (bannersRes.ok) setBanners(await bannersRes.json());
    } catch {
      setError("Erro ao carregar dados.");
    } finally {
      setLoadingData(false);
    }
  };

  const getStoreByOwner = (ownerId: number) =>
    stores.find((s) => s.owner_id === ownerId);

  // ── Ações: usuários ──

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
        setError(data.detail || "Erro.");
      }
    } catch {
      setError("Erro ao conectar.");
    } finally {
      setActionLoading(null);
    }
  };

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
        setError(data.detail || "Erro.");
      }
    } catch {
      setError("Erro ao conectar.");
    } finally {
      setActionLoading(null);
    }
  };

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
        setError(data.detail || "Erro.");
      }
    } catch {
      setError("Erro ao conectar.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Ações: banners ──

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleBannerUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFile) return;
    setUploadingBanner(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("file", bannerFile);
      if (bannerForm.title) formData.append("title", bannerForm.title);
      if (bannerForm.link_url) formData.append("link_url", bannerForm.link_url);

      const res = await fetch(`${API_URL}/admin/banners`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const newBanner = await res.json();
        setBanners((prev) => [...prev, newBanner]);
        setBannerForm({ title: "", link_url: "" });
        setBannerFile(null);
        setBannerPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setSuccess("Banner adicionado com sucesso!");
      } else {
        const data = await res.json();
        setError(data.detail || "Erro ao fazer upload.");
      }
    } catch {
      setError("Erro ao conectar.");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleToggleBanner = async (banner: Banner) => {
    try {
      const res = await fetch(`${API_URL}/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !banner.is_active }),
      });
      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) =>
            b.id === banner.id ? { ...b, is_active: !b.is_active } : b,
          ),
        );
      }
    } catch {
      setError("Erro ao atualizar banner.");
    }
  };

  const handleDeleteBanner = async (banner: Banner) => {
    if (!confirm(`Excluir o banner "${banner.title || "sem título"}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/banners/${banner.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 204) {
        setBanners((prev) => prev.filter((b) => b.id !== banner.id));
        setSuccess("Banner excluído.");
      }
    } catch {
      setError("Erro ao excluir banner.");
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
      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
        {/* ── Título ─────────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">
            Painel Administrativo
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie usuários, planos e banners da plataforma.
          </p>
        </div>

        {/* ── Métricas ───────────────────────────────────────────────────────── */}
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
          <div className="bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl shadow-md p-5 text-center col-span-2 md:col-span-1">
            <p className="text-3xl font-black text-white">{metrics.premium}</p>
            <p className="text-white/80 text-sm mt-1">⭐ Premium</p>
          </div>
        </div>

        {/* ── Feedback ───────────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm">
            ✅ {success}
          </div>
        )}

        {/* ── Abas ───────────────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "usuarios"
                ? "bg-shopping-dark text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            👥 Usuários
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "banners"
                ? "bg-shopping-dark text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            🖼️ Banners {banners.length > 0 && `(${banners.length})`}
          </button>
        </div>

        {/* ── Aba: Usuários ──────────────────────────────────────────────────── */}
        {activeTab === "usuarios" && (
          <div className="bg-white rounded-2xl shadow-md">
            <div className="p-6 border-b border-gray-100">
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
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
                      <td
                        colSpan={6}
                        className="py-16 text-center text-gray-400"
                      >
                        {search
                          ? "Nenhum usuário encontrado."
                          : "Nenhum usuário cadastrado."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => {
                      const isMe = u.id === user.id;
                      const isBusy = actionLoading === u.id;
                      const store =
                        u.role === "lojista"
                          ? getStoreByOwner(u.id)
                          : undefined;

                      return (
                        <tr
                          key={u.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
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
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge(u.role)}`}
                            >
                              {roleLabel(u.role)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {u.is_active ? "● Ativo" : "● Bloqueado"}
                            </span>
                          </td>
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
                                >
                                  {isBusy ? "..." : nextPlanLabel(store.plan)}
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-gray-500 hidden md:table-cell">
                            {formatDate(u.created_at)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              {isMe ? (
                                <span className="text-xs text-gray-400 italic">
                                  você
                                </span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleToggleBlock(u)}
                                    disabled={isBusy}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${u.is_active ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
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
        )}

        {/* ── Aba: Banners ───────────────────────────────────────────────────── */}
        {activeTab === "banners" && (
          <div className="space-y-6">
            {/* Formulário de upload */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-black text-gray-900 mb-6">
                ➕ Adicionar novo banner
              </h2>
              <form onSubmit={handleBannerUpload} className="space-y-4">
                {/* Área de upload */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {bannerPreview ? (
                    <div className="relative h-48 rounded-xl overflow-hidden">
                      <Image
                        src={bannerPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-4xl mb-2">🖼️</p>
                      <p className="text-gray-600 font-semibold">
                        Clique para selecionar a imagem
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        JPEG, PNG ou WebP — máximo 5MB
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerFileChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Título (opcional)
                    </label>
                    <input
                      type="text"
                      value={bannerForm.title}
                      onChange={(e) =>
                        setBannerForm({ ...bannerForm, title: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      placeholder="Ex: Promoção de Inverno"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Link ao clicar (opcional)
                    </label>
                    <input
                      type="text"
                      value={bannerForm.link_url}
                      onChange={(e) =>
                        setBannerForm({
                          ...bannerForm,
                          link_url: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      placeholder="https://vitrine-cg.com.br/lojas/1"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!bannerFile || uploadingBanner}
                  className="btn-primary py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingBanner ? "Enviando..." : "Publicar banner →"}
                </button>
              </form>
            </div>

            {/* Lista de banners */}
            <div className="bg-white rounded-2xl shadow-md">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-black text-gray-900">
                  Banners cadastrados
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {banners.length} {banners.length === 1 ? "banner" : "banners"}{" "}
                  — exibidos em ordem crescente
                </p>
              </div>

              {banners.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-4xl mb-3">🖼️</p>
                  <p>Nenhum banner cadastrado ainda.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {banners.map((banner) => (
                    <div
                      key={banner.id}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Preview */}
                      <div className="relative w-24 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={banner.image_url}
                          alt={banner.title ?? "Banner"}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {banner.title || "Sem título"}
                        </p>
                        {banner.link_url && (
                          <p className="text-gray-400 text-xs truncate mt-0.5">
                            {banner.link_url}
                          </p>
                        )}
                        <p className="text-gray-400 text-xs mt-0.5">
                          Ordem: {banner.order} ·{" "}
                          {formatDate(banner.created_at)}
                        </p>
                      </div>

                      {/* Status + ações */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${banner.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {banner.is_active ? "● Ativo" : "● Inativo"}
                        </span>
                        <button
                          onClick={() => handleToggleBanner(banner)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                        >
                          {banner.is_active ? "Pausar" : "Ativar"}
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
