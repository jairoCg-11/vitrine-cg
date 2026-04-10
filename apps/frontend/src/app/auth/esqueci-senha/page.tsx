"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.detail || "Erro ao enviar email.");
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
                  Recuperar acesso
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {sent ? (
            /* Estado: email enviado */
            <div className="text-center">
              <p className="text-5xl mb-4">📧</p>
              <h1 className="text-xl font-black text-gray-900 mb-3">
                Email enviado!
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Se o email <strong>{email}</strong> estiver cadastrado, você
                receberá as instruções para redefinir sua senha em breve.
              </p>
              <p className="text-gray-400 text-xs mb-6">
                Verifique também a caixa de spam.
              </p>
              <Link
                href="/auth/login"
                className="btn-primary inline-block px-8 py-3"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            /* Estado: formulário */
            <>
              <h1 className="text-2xl font-black text-gray-900 mb-2">
                Esqueci minha senha
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Informe seu email e enviaremos um link para redefinir sua senha.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    placeholder="seu@email.com"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>

              <p className="text-center text-gray-400 text-sm mt-6">
                Lembrou a senha?{" "}
                <Link
                  href="/auth/login"
                  className="text-orange-600 font-semibold hover:underline"
                >
                  Fazer login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
