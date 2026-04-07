"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    if (!confirm(`Excluir "${name}"? Esta ação é irreversível.`)) return;
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
      {/* Header */}
      <header className="bg-shopping-dark text-white px-4 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center font-black">
              V
            </div>
            <div>
              <p className="font-black leading-none">Vitrine CG</p>
              <p className="text-orange-400 text-xs leading-none">Painel do Lojista</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/70 text-sm hidden md:block">
              Olá, {user?.name.split(" ")[0]}!
            </span>
            <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors">
              Ver shopping
            </Link>
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!hasStore ? (
          /* Sem loja cadastrada */
          <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-lg mx-auto">
            <p className="text-5xl mb-4">🏪</p>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Cadastre sua loja
            </h2>
            <p className="text-gray-500 mb-6">
              Você ainda não tem uma loja cadastrada. Crie agora e comece a vender!
            </p>
            <Link href="/dashboard/loja/nova" className="btn-primary inline-block">
              Criar minha loja →
            </Link>
          </div>
        ) : (
          <>
            {/* Info da loja */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">{store?.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    {store?.segment && (
                      <span className="badge bg-orange-100 text-orange-700">{store.segment}</span>
                    )}
                    <span className={`badge ${store?.is_open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {store?.is_open ? "● Aberta" : "● Fechada"}
                    </span>
                    <span className="badge bg-blue-100 text-blue-700 capitalize">
                      Plano {store?.plan}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={toggleOpen}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      store?.is_open
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {store?.is_open ? "Fechar loja" : "Abrir loja"}
                  </button>
                  <Link
                    href="/dashboard/loja/editar"
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-all"
                  >
                    Editar loja
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-md p-5 text-center">
                <p className="text-3xl font-black text-orange-500">{products.length}</p>
                <p className="text-gray-500 text-sm mt-1">Produtos</p>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-5 text-center">
                <p className="text-3xl font-black text-green-500">
                  {products.filter((p) => p.is_available).length}
                </p>
                <p className="text-gray-500 text-sm mt-1">Disponíveis</p>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-5 text-center col-span-2 md:col-span-1">
                <p className="text-3xl font-black text-blue-500 capitalize">{store?.plan}</p>
                <p className="text-gray-500 text-sm mt-1">Plano atual</p>
              </div>
            </div>

            {/* Produtos */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-gray-900">
                  🛍️ Meus Produtos
                </h2>
                <Link
                  href="/dashboard/produtos/novo"
                  className="btn-primary text-sm py-2"
                >
                  + Novo produto
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📦</p>
                  <p className="text-gray-500">Nenhum produto cadastrado ainda.</p>
                  <Link href="/dashboard/produtos/novo" className="btn-primary inline-block mt-4 text-sm">
                    Cadastrar primeiro produto
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Produto</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Categoria</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Preço</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Status</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium text-gray-900">{product.name}</td>
                          <td className="py-3 px-2 text-gray-500">
                            <span>{product.category || "—"}</span>
                            {product.sizes && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {product.sizes.split(",").map((s) => (
                                  <span key={s} className="badge bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-2 font-semibold text-orange-600">
                            R$ {Number(product.price).toFixed(2).replace(".", ",")}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`badge ${product.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {product.is_available ? "Disponível" : "Indisponível"}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-end gap-3">
                              <Link
                                href={`/dashboard/produtos/${product.id}/editar`}
                                className="text-orange-600 hover:text-orange-700 font-semibold"
                              >
                                Editar
                              </Link>
                              <button
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                disabled={deletingId === product.id}
                                className="text-red-500 hover:text-red-600 font-semibold disabled:opacity-40"
                              >
                                {deletingId === product.id ? "..." : "Excluir"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
