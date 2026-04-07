"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  sizes: string | null;
  image_url: string | null;
  is_available: boolean;
}

export default function EditarProdutoPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    is_available: true,
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const categories = [
    "Roupas", "Calçados", "Eletrônicos", "Acessórios",
    "Alimentos", "Beleza", "Casa", "Esportes", "Brinquedos", "Outros"
  ];
  const SIZES = ["PP", "P", "M", "G", "GG", "XG"];

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/stores/me/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const products: Product[] = await res.json();
      const found = products.find((p) => p.id === Number(productId));
      if (found) {
        setProduct(found);
        setForm({
          name: found.name,
          description: found.description || "",
          price: String(found.price),
          category: found.category || "",
          is_available: found.is_available,
        });
        setSelectedSizes(found.sizes ? found.sizes.split(",") : []);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
  }, [token, productId]);

  useEffect(() => {
    if (token) fetchProduct();
  }, [token, fetchProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/stores/me/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          sizes: selectedSizes.length > 0 ? selectedSizes.join(",") : null,
        }),
      });

      if (res.ok) {
        setSuccess("Produto atualizado com sucesso!");
      } else {
        const data = await res.json();
        setError(data.detail || "Erro ao atualizar.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/stores/me/products/${productId}/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setSuccess("Foto atualizada!");
        fetchProduct();
      } else {
        setError("Erro ao fazer upload da foto.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    setDeleting(true);

    try {
      const res = await fetch(`${API_URL}/stores/me/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError("Erro ao excluir produto.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setDeleting(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-3">
        <p className="text-gray-500">Produto não encontrado.</p>
        <Link href="/dashboard" className="text-orange-600 font-semibold text-sm hover:underline">
          ← Voltar ao dashboard
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-shopping-dark text-white px-4 py-4 shadow-xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center font-black">V</div>
            <p className="font-black">Editar Produto</p>
          </div>
          <Link href="/dashboard" className="text-white/70 hover:text-white text-sm transition-colors">
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Upload de foto */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">📸 Foto do produto</h2>
          <div className="flex items-start gap-6">
            <div className="relative w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                  📦
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-3">
                Formatos aceitos: JPEG, PNG ou WebP. Tamanho máximo: 5MB.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
                {uploadingImage ? "Enviando..." : "📁 Trocar foto"}
              </label>
            </div>
          </div>
        </div>

        {/* Dados do produto */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-lg font-black text-gray-900 mb-6">📝 Dados do produto</h2>

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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preço (R$) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                  <option value="">Selecione...</option>
                  {categories.map((c) => (
                    <option key={c} value={c.toLowerCase()}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tamanhos — apenas para Roupas */}
            {form.category === "roupas" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tamanhos disponíveis
                </label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`w-12 h-12 rounded-xl border-2 font-bold text-sm transition-all ${
                        selectedSizes.includes(size)
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-gray-200 text-gray-600 hover:border-orange-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSizes.length === 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Nenhum tamanho selecionado.
                  </p>
                )}
              </div>
            )}

            {/* Disponibilidade */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="available"
                checked={form.is_available}
                onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                className="w-5 h-5 accent-orange-500"
              />
              <label htmlFor="available" className="text-sm font-semibold text-gray-700">
                Produto disponível para venda
              </label>
            </div>

            <div className="flex gap-4 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 text-center py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3 text-center disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </div>

        {/* Zona de perigo */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-red-100">
          <h2 className="text-lg font-black text-red-600 mb-2">⚠️ Zona de perigo</h2>
          <p className="text-gray-500 text-sm mb-4">
            Esta ação é irreversível. O produto será excluído permanentemente.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            {deleting ? "Excluindo..." : "Excluir produto"}
          </button>
        </div>
      </div>
    </div>
  );
}
