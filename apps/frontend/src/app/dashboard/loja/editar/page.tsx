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
  is_open: boolean;
}

export default function EditarLojaPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    segment: "",
    location: "",
    whatsapp: "",
    instagram: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const segments = [
    "Roupas", "Calçados", "Eletrônicos", "Acessórios",
    "Alimentos", "Beleza", "Casa", "Esportes", "Brinquedos", "Outros"
  ];

  useEffect(() => {
    if (token) fetchStore();
  }, [token]);

  const fetchStore = async () => {
    const res = await fetch(`${API_URL}/stores/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setStore(data);
      setForm({
        name: data.name || "",
        description: data.description || "",
        segment: data.segment || "",
        location: data.location || "",
        whatsapp: data.whatsapp || "",
        instagram: data.instagram || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/stores/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess("Loja atualizada com sucesso!");
        fetchStore();
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

  const handleImageUpload = async (
    file: File,
    type: "logo" | "cover"
  ) => {
    const setter = type === "logo" ? setUploadingLogo : setUploadingCover;
    setter(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/stores/me/${type}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setSuccess(`${type === "logo" ? "Logo" : "Capa"} atualizada!`);
        fetchStore();
      } else {
        setError("Erro ao fazer upload da imagem.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setter(false);
    }
  };

  if (!store) {
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
            <p className="font-black">Editar Loja</p>
          </div>
          <Link href="/dashboard" className="text-white/70 hover:text-white text-sm transition-colors">
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Upload de imagens */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">📸 Imagens da loja</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Logo</p>
              <div className="relative h-32 bg-gray-100 rounded-xl overflow-hidden mb-3">
                {store.logo_url ? (
                  <Image src={store.logo_url} alt="Logo" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sem logo
                  </div>
                )}
              </div>
              <label className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "logo")}
                />
                {uploadingLogo ? "Enviando..." : "📁 Trocar logo"}
              </label>
            </div>

            {/* Capa */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Foto de capa</p>
              <div className="relative h-32 bg-gray-100 rounded-xl overflow-hidden mb-3">
                {store.cover_url ? (
                  <Image src={store.cover_url} alt="Capa" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sem capa
                  </div>
                )}
              </div>
              <label className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "cover")}
                />
                {uploadingCover ? "Enviando..." : "📁 Trocar capa"}
              </label>
            </div>
          </div>
        </div>

        {/* Dados da loja */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-lg font-black text-gray-900 mb-6">📝 Dados da loja</h2>

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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da loja *</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Segmento</label>
                <select
                  value={form.segment}
                  onChange={(e) => setForm({ ...form, segment: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                  <option value="">Selecione...</option>
                  {segments.map((s) => (
                    <option key={s} value={s.toLowerCase()}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Localização</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="Ex: Loja 42, Bloco B"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="83999999999"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Instagram</label>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="@minhaloja"
                />
              </div>
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
      </div>
    </div>
  );
}
