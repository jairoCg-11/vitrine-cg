"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ new_password: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Link inválido. Solicite um novo link de recuperação.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.new_password !== form.confirm_password) {
      setError("As senhas não coincidem.");
      return;
    }

    if (form.new_password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: form.new_password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 3000);
      } else {
        setError(data.detail || "Erro ao redefinir senha.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-shopping-dark to-shopping-medium flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl font-black text-white">
                V
              </div>
              <div className="text-left">
                <p className="font-black text-xl text-white leading-none">
                  Vitrine CG
                </p>
                <p className="text-orange-400 text-sm leading-none">
                  Nova senha
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {success ? (
            /* Estado: sucesso */
            <div className="text-center">
              <p className="text-5xl mb-4">✅</p>
              <h1 className="text-xl font-black text-gray-900 mb-3">
                Senha redefinida!
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Sua senha foi alterada com sucesso. Você será redirecionado para
                o login em instantes.
              </p>
              <Link
                href="/auth/login"
                className="btn-primary inline-block px-8 py-3"
              >
                Fazer login agora
              </Link>
            </div>
          ) : (
            /* Estado: formulário */
            <>
              <h1 className="text-2xl font-black text-gray-900 mb-2">
                Nova senha
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Defina uma nova senha para sua conta. Mínimo de 6 caracteres.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                  {error}
                  {!token && (
                    <div className="mt-2">
                      <Link
                        href="/auth/esqueci-senha"
                        className="text-red-700 font-semibold underline"
                      >
                        Solicitar novo link →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nova senha
                  </label>
                  <input
                    type="password"
                    required
                    disabled={!token}
                    value={form.new_password}
                    onChange={(e) =>
                      setForm({ ...form, new_password: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Mínimo 6 caracteres"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Confirmar nova senha
                  </label>
                  <input
                    type="password"
                    required
                    disabled={!token}
                    value={form.confirm_password}
                    onChange={(e) =>
                      setForm({ ...form, confirm_password: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Salvando..." : "Salvar nova senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-shopping-dark to-shopping-medium flex items-center justify-center">
          <p className="text-white">Carregando...</p>
        </div>
      }
    >
      <RedefinirSenhaForm />
    </Suspense>
  );
}
