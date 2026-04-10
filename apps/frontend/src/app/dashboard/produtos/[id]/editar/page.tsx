"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_IMAGES = 3;

interface ProductImage {
  id: number;
  image_url: string;
  order: number;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  sizes: string | null;
  image_url: string | null;
  is_available: boolean;
  images: ProductImage[];
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
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = [
    "Roupas",
    "Calçados",
    "Eletrônicos",
    "Acessórios",
    "Alimentos",
    "Beleza",
    "Casa",
    "Esportes",
    "Brinquedos",
    "Outros",
  ];
  const SIZES = ["PP", "P", "M", "G", "GG", "XG"];

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
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
        setSuccess("Produto atualizado!");
      } else {
        const data = await res.json();
        setError(data.detail || "Erro ao atualizar.");
      }
    } catch {
      setError("Erro ao conectar.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (file: File) => {
    if (!product) return;
    if (product.images.length >= MAX_IMAGES) {
      setError(`Máximo de ${MAX_IMAGES} imagens por produto.`);
      return;
    }
    setUploadingImage(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `${API_URL}/stores/me/products/${productId}/images`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      if (res.ok) {
        setSuccess("Foto adicionada!");
        fetchProduct();
      } else {
        const data = await res.json();
        setError(data.detail || "Erro ao fazer upload.");
      }
    } catch {
      setError("Erro ao conectar.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Remover esta foto?")) return;
    setDeletingImageId(imageId);
    try {
      const res = await fetch(
        `${API_URL}/stores/me/products/${productId}/images/${imageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok || res.status === 204) {
        fetchProduct();
      } else {
        setError("Erro ao remover foto.");
      }
    } catch {
      setError("Erro ao conectar.");
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Excluir este produto?\n\nEsta ação é irreversível.")) return;
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
      setError("Erro ao conectar.");
    } finally {
      setDeleting(false);
    }
  };

  if (notFound)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-3">
        <p className="text-gray-500">Produto não encontrado.</p>
        <Link
          href="/dashboard"
          className="text-orange-600 font-semibold text-sm hover:underline"
        >
          ← Voltar
        </Link>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-shopping-dark text-white px-4 py-4 shadow-xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center font-black">
              V
            </div>
            <p className="font-black">Editar Produto</p>
          </div>
          <Link
            href="/dashboard"
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* ── Fotos do produto ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900">
              📸 Fotos do produto
            </h2>
            <span className="text-sm text-gray-400">
              {product.images.length}/{MAX_IMAGES} fotos
            </span>
          </div>

          {/* Grid de fotos existentes */}
          {product.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {product.images.map((img, index) => (
                <div key={img.id} className="relative group">
                  <div className="relative h-28 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={img.image_url}
                      alt={`Foto ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1">
                        <span className="badge bg-orange-500 text-white text-xs px-1.5 py-0.5">
                          Principal
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    disabled={deletingImageId === img.id}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  >
                    {deletingImageId === img.id ? "..." : "×"}
                  </button>
                </div>
              ))}

              {/* Slot de upload — aparece quando tem menos de 3 fotos */}
              {product.images.length < MAX_IMAGES && (
                <label className="h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-1">
                  <span className="text-2xl text-gray-300">+</span>
                  <span className="text-xs text-gray-400 font-semibold">
                    {uploadingImage ? "Enviando..." : "Adicionar"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={(e) =>
                      e.target.files?.[0] && handleAddImage(e.target.files[0])
                    }
                  />
                </label>
              )}
            </div>
          )}

          {/* Sem fotos — área de upload maior */}
          {product.images.length === 0 && (
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer mb-4">
              <span className="text-4xl mb-2">📦</span>
              <span className="text-gray-500 font-semibold text-sm">
                {uploadingImage
                  ? "Enviando..."
                  : "Clique para adicionar a primeira foto"}
              </span>
              <span className="text-gray-400 text-xs mt-1">
                JPEG, PNG ou WebP — máx 5MB
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingImage}
                onChange={(e) =>
                  e.target.files?.[0] && handleAddImage(e.target.files[0])
                }
              />
            </label>
          )}

          <p className="text-xs text-gray-400">
            A primeira foto é a principal exibida nos cards. Máximo de{" "}
            {MAX_IMAGES} fotos por produto.
          </p>
        </div>

        {/* ── Dados do produto ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-lg font-black text-gray-900 mb-6">
            📝 Dados do produto
          </h2>

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
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nome do produto *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Preço (R$) *
                </label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                  <option value="">Selecione...</option>
                  {categories.map((c) => (
                    <option key={c} value={c.toLowerCase()}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                      className={`w-12 h-12 rounded-xl border-2 font-bold text-sm transition-all ${selectedSizes.includes(size) ? "border-orange-500 bg-orange-500 text-white" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="available"
                checked={form.is_available}
                onChange={(e) =>
                  setForm({ ...form, is_available: e.target.checked })
                }
                className="w-4 h-4 accent-orange-500"
              />
              <label
                htmlFor="available"
                className="text-sm font-semibold text-gray-700"
              >
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

        {/* ── Excluir produto ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-black text-gray-900 mb-2">
            ⚠️ Zona de perigo
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Esta ação é irreversível e remove o produto e todas as suas fotos.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            {deleting ? "Excluindo..." : "Excluir produto"}
          </button>
        </div>
      </div>
    </div>
  );
}
