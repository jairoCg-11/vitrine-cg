"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TrocarSenhaPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.new_password !== form.confirm_password) {
      setError("A nova senha e a confirmação não coincidem.");
      return;
    }

    if (form.new_password.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setForm({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        setError(data.detail || "Erro ao alterar senha.");
      }
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
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center font-black">
              V
            </div>
            <p className="font-black">Trocar Senha</p>
          </div>
          <Link
            href="/dashboard"
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-xl font-black text-gray-900 mb-1">
            🔒 Alterar senha
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Sua nova senha deve ter pelo menos 6 caracteres.
          </p>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Senha atual
              </label>
              <input
                type="password"
                required
                value={form.current_password}
                onChange={(e) =>
                  setForm({ ...form, current_password: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nova senha
              </label>
              <input
                type="password"
                required
                value={form.new_password}
                onChange={(e) =>
                  setForm({ ...form, new_password: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Confirmar nova senha
              </label>
              <input
                type="password"
                required
                value={form.confirm_password}
                onChange={(e) =>
                  setForm({ ...form, confirm_password: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Alterando..." : "Alterar senha"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
