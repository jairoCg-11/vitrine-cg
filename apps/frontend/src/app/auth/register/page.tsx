"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import TermsModal from "@/components/auth/TermsModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Controle do modal e aceite dos termos
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Ao clicar em "Criar conta" — abre o modal se ainda não aceitou
  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas antes de abrir o modal
    if (!form.name || !form.email || !form.password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!termsAccepted) {
      // Abre o modal de termos
      setShowTerms(true);
      return;
    }

    // Já aceitou — submete direto
    handleRegister();
  };

  const handleAcceptTerms = () => {
    setShowTerms(false);
    setTermsAccepted(true);
    // Submete o cadastro após aceitar
    handleRegister(true);
  };

  const handleRejectTerms = () => {
    setShowTerms(false);
    setTermsAccepted(false);
  };

  const handleRegister = async (accepted = termsAccepted) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          role: "lojista",
          terms_accepted: accepted,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Erro ao cadastrar.");
        return;
      }

      // Login automático após cadastro
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const loginData = await loginRes.json();
      login(loginData.access_token, loginData.user);
      router.push("/dashboard");
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal de termos */}
      {showTerms && (
        <TermsModal onAccept={handleAcceptTerms} onReject={handleRejectTerms} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-shopping-dark to-shopping-medium flex items-center justify-center px-4 py-12">
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
                    Cadastro de Lojista
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Cadastrar loja grátis
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Já tem conta?{" "}
              <Link
                href="/auth/login"
                className="text-orange-600 font-semibold hover:underline"
              >
                Fazer login
              </Link>
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Badge de termos aceitos */}
            {termsAccepted && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2">
                ✅ Termos de uso aceitos
              </div>
            )}

            <form onSubmit={handleSubmitClick} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="(83) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading
                  ? "Cadastrando..."
                  : termsAccepted
                    ? "Criar minha loja →"
                    : "Continuar →"}
              </button>
            </form>

            <p className="text-gray-400 text-xs text-center mt-4">
              Ao continuar, você será solicitado a aceitar nossos{" "}
              <button
                onClick={() => setShowTerms(true)}
                className="text-orange-600 hover:underline font-semibold"
              >
                Termos de Uso
              </button>
            </p>
          </div>

          <p className="text-center text-white/50 text-sm mt-6">
            <Link href="/" className="hover:text-white transition-colors">
              ← Voltar para o shopping
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
