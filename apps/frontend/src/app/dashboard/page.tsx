"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Store {
  id: number;
  name: string;
  description: string | null;
  segment: string | null;
  location: string | null;
  whatsapp: string | null;
  instagram: string | null;
  logo_url: string | null;
  cover_url: string | null;
  plan: string;
  is_active: boolean;
  is_open: boolean;
}

interface Product {
  id: number;
  name: string;
  price: string;
  category: string | null;
  sizes: string | null;
  image_url: string | null;
  is_available: boolean;
}

export default function DashboardPage() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [hasStore, setHasStore] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/auth/login");
      return;
    }
    if (!isLoading && user?.role !== "lojista") {
      router.push("/");
      return;
    }
    if (token) fetchData();
  }, [token, isLoading]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/stores/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const storeData = await res.json();
        setStore(storeData);
        setHasStore(true);
        const prodRes = await fetch(`${API_URL}/stores/me/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (prodRes.ok) setProducts(await prodRes.json());
      }
    } catch {
      console.error("Erro ao carregar dados");
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Excluir "${name}"?\n\nEsta ação é irreversível.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/stores/me/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      console.error("Erro ao excluir produto");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleOpen = async () => {
    if (!store) return;
    const res = await fetch(`${API_URL}/stores/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_open: !store.is_open }),
    });
    if (res.ok) setStore({ ...store, is_open: !store.is_open });
  };

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-shopping-dark text-white px-4 py-3 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center font-black text-sm">
              V
            </div>
            <div>
              <p className="font-black text-sm leading-none">Vitrine CG</p>
              <p className="text-orange-400 text-xs leading-none">
                Painel do Lojista
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-xs hidden sm:block">
              Olá, {user?.name.split(" ")[0]}!
            </span>
            <Link
              href="/"
              className="text-white/70 hover:text-white text-xs transition-colors"
            >
              Ver shopping
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="text-white/70 hover:text-white text-xs transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {!hasStore ? (
          /* Sem loja cadastrada */
          <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-lg mx-auto">
            <p className="text-5xl mb-4">🏪</p>
            <h2 className="text-xl font-black text-gray-900 mb-2">
              Cadastre sua loja
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Você ainda não tem uma loja cadastrada. Crie agora e comece a
              vender!
            </p>
            <Link
              href="/dashboard/loja/nova"
              className="btn-primary inline-block"
            >
              Criar minha loja →
            </Link>
          </div>
        ) : (
          <>
            {/* ── Info da loja ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                {/* Logo */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  {store?.logo_url ? (
                    <Image
                      src={store.logo_url}
                      alt={store.name}
                      width={56}
                      height={56}
                      unoptimized
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white font-black text-xl">
                      {store?.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-black text-gray-900 truncate">
                    {store?.name}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {store?.segment && (
                      <span className="badge bg-orange-100 text-orange-700 text-xs">
                        {store.segment}
                      </span>
                    )}
                    <span
                      className={`badge text-xs ${store?.is_open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {store?.is_open ? "● Aberta" : "● Fechada"}
                    </span>
                    <span className="badge bg-blue-100 text-blue-700 text-xs capitalize">
                      Plano {store?.plan}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={toggleOpen}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    store?.is_open
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {store?.is_open ? "Fechar loja" : "Abrir loja"}
                </button>
                <Link
                  href="/dashboard/loja/editar"
                  className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-all"
                >
                  Editar loja
                </Link>
                <Link
                  href={`/lojas/${store?.id}`}
                  className="flex-1 sm:flex-none text-center px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all"
                >
                  Ver loja →
                </Link>
              </div>
            </div>

            {/* ── Stats ────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-2xl shadow-md p-4 text-center">
                <p className="text-2xl font-black text-orange-500">
                  {products.length}
                </p>
                <p className="text-gray-500 text-xs mt-1">Produtos</p>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-4 text-center">
                <p className="text-2xl font-black text-green-500">
                  {products.filter((p) => p.is_available).length}
                </p>
                <p className="text-gray-500 text-xs mt-1">Disponíveis</p>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-4 text-center">
                <p className="text-2xl font-black text-blue-500 capitalize">
                  {store?.plan}
                </p>
                <p className="text-gray-500 text-xs mt-1">Plano</p>
              </div>
            </div>

            {/* ── Produtos ─────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-gray-900">
                  🛍️ Meus Produtos
                </h2>
                <Link
                  href="/dashboard/produtos/novo"
                  className="btn-primary text-xs py-2 px-3"
                >
                  + Novo
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">📦</p>
                  <p className="text-gray-500 text-sm">
                    Nenhum produto cadastrado ainda.
                  </p>
                  <Link
                    href="/dashboard/produtos/novo"
                    className="btn-primary inline-block mt-4 text-sm"
                  >
                    Cadastrar primeiro produto
                  </Link>
                </div>
              ) : (
                <>
                  {/* Cards mobile */}
                  <div className="md:hidden space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl"
                      >
                        {/* Imagem */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={56}
                              height={56}
                              unoptimized
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">
                              📦
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-orange-600 font-bold text-sm">
                            R${" "}
                            {Number(product.price).toFixed(2).replace(".", ",")}
                          </p>
                          <span
                            className={`badge text-xs ${product.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {product.is_available
                              ? "Disponível"
                              : "Indisponível"}
                          </span>
                        </div>
                        {/* Ações */}
                        <div className="flex flex-col gap-1.5">
                          <Link
                            href={`/dashboard/produtos/${product.id}/editar`}
                            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold text-center"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteProduct(product.id, product.name)
                            }
                            disabled={deletingId === product.id}
                            className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-semibold disabled:opacity-40"
                          >
                            {deletingId === product.id ? "..." : "Excluir"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tabela desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-2 font-semibold text-gray-600">
                            Produto
                          </th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-600">
                            Categoria
                          </th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-600">
                            Preço
                          </th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-600">
                            Status
                          </th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-600">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr
                            key={product.id}
                            className="border-b border-gray-50 hover:bg-gray-50"
                          >
                            <td className="py-3 px-2 font-medium text-gray-900">
                              {product.name}
                            </td>
                            <td className="py-3 px-2 text-gray-500">
                              {product.category || "—"}
                            </td>
                            <td className="py-3 px-2 font-semibold text-orange-600">
                              R${" "}
                              {Number(product.price)
                                .toFixed(2)
                                .replace(".", ",")}
                            </td>
                            <td className="py-3 px-2">
                              <span
                                className={`badge ${product.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                              >
                                {product.is_available
                                  ? "Disponível"
                                  : "Indisponível"}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center justify-end gap-3">
                                <Link
                                  href={`/dashboard/produtos/${product.id}/editar`}
                                  className="text-orange-600 hover:text-orange-700 font-semibold text-sm"
                                >
                                  Editar
                                </Link>
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(
                                      product.id,
                                      product.name,
                                    )
                                  }
                                  disabled={deletingId === product.id}
                                  className="text-red-500 hover:text-red-600 font-semibold text-sm disabled:opacity-40"
                                >
                                  {deletingId === product.id
                                    ? "..."
                                    : "Excluir"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
