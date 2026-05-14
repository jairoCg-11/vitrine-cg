"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Product {
  id: number;
  name: string;
  price: string;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
}

interface Props {
  storeId: number;
  storeName: string;
  hasCover: boolean;
  hasLogo: boolean;
}

export default function AdminModerationPanel({
  storeId,
  storeName,
  hasCover,
  hasLogo,
}: Props) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [coverExists, setCoverExists] = useState(hasCover);
  const [logoExists, setLogoExists] = useState(hasLogo);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading || !user || user.role !== "admin") return null;

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`${API_URL}/admin/stores/${storeId}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProducts(await res.json());
    } catch {
      setError("Erro ao carregar produtos.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    fetchProducts();
  };

  const handleDeleteProduct = async (product: Product) => {
    if (
      !confirm(
        `Excluir o produto "${product.name}"?\n\nEsta ação não pode ser desfeita.`,
      )
    )
      return;
    setActionLoading(`product-${product.id}`);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(
        `${API_URL}/admin/stores/${storeId}/products/${product.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok || res.status === 204) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        setSuccess(`Produto "${product.name}" removido.`);
      } else {
        setError("Erro ao remover produto.");
      }
    } catch {
      setError("Erro ao conectar.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCover = async () => {
    if (!confirm("Remover a foto de capa desta loja?")) return;
    setActionLoading("cover");
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_URL}/admin/stores/${storeId}/cover`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCoverExists(false);
        setSuccess("Foto de capa removida.");
        router.refresh();
      } else {
        setError("Erro ao remover capa.");
      }
    } catch {
      setError("Erro ao conectar.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm("Remover o logo desta loja?")) return;
    setActionLoading("logo");
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_URL}/admin/stores/${storeId}/logo`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLogoExists(false);
        setSuccess("Logo removido.");
        router.refresh();
      } else {
        setError("Erro ao remover logo.");
      }
    } catch {
      setError("Erro ao conectar.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      {/* Botão flutuante de moderação */}
      <div className="fixed bottom-6 left-4 z-50">
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-3 rounded-2xl shadow-xl transition-all hover:scale-105 text-sm"
        >
          🛡️ <span className="hidden sm:inline">Moderação Admin</span>
        </button>
      </div>

      {/* Painel de moderação */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  🛡️ Moderação
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">{storeName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Conteúdo */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
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

              {/* Imagens da loja */}
              <div>
                <h3 className="text-sm font-black text-gray-700 mb-3">
                  🖼️ Imagens da loja
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteCover}
                    disabled={!coverExists || actionLoading === "cover"}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  >
                    {actionLoading === "cover"
                      ? "Removendo..."
                      : coverExists
                        ? "🗑️ Remover capa"
                        : "Sem capa"}
                  </button>
                  <button
                    onClick={handleDeleteLogo}
                    disabled={!logoExists || actionLoading === "logo"}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  >
                    {actionLoading === "logo"
                      ? "Removendo..."
                      : logoExists
                        ? "🗑️ Remover logo"
                        : "Sem logo"}
                  </button>
                </div>
              </div>

              {/* Produtos */}
              <div>
                <h3 className="text-sm font-black text-gray-700 mb-3">
                  📦 Produtos ({products.length})
                </h3>

                {loadingProducts ? (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    Carregando...
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    Nenhum produto cadastrado.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl"
                      >
                        {/* Imagem */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={40}
                              height={40}
                              unoptimized
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">
                              📦
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            R${" "}
                            {Number(product.price).toFixed(2).replace(".", ",")}
                            {product.category && ` · ${product.category}`}
                          </p>
                        </div>

                        {/* Botão excluir */}
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          disabled={actionLoading === `product-${product.id}`}
                          className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 flex-shrink-0"
                        >
                          {actionLoading === `product-${product.id}`
                            ? "..."
                            : "Excluir"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <p className="text-xs text-gray-400 text-center">
                ⚠️ Ações de moderação são irreversíveis e não notificam o
                lojista.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
