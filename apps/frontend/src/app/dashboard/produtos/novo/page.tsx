"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function NovoProdutoPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/stores/me/products`, {
        method: "POST",
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

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Erro ao criar produto.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-shopping-dark text-white px-4 py-4 shadow-xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center font-black">V</div>
            <p className="font-black">Novo Produto</p>
          </div>
          <Link href="/dashboard" className="text-white/70 hover:text-white text-sm transition-colors">
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Novo produto</h1>
          <p className="text-gray-500 text-sm mb-8">
            Adicione um produto à sua loja. Você pode adicionar a foto depois.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              {error}
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
                placeholder="Ex: Camiseta Básica Branca"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                placeholder="Descreva o produto..."
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
                  placeholder="49.90"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Categoria
                </label>
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
                    Nenhum tamanho selecionado — selecione ao menos um.
                  </p>
                )}
              </div>
            )}

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
                {loading ? "Salvando..." : "Criar produto →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
