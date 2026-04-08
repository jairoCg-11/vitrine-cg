"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(search)}`;
    }
  };

  return (
    <header className="bg-shopping-dark text-white sticky top-0 z-50 shadow-2xl">
      {/* ── Linha principal ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0"
            onClick={() => setMenuOpen(false)}
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-lg font-black">
                V
              </div>
              <div className="hidden sm:block">
                <p className="font-black text-base leading-none">Vitrine</p>
                <p className="text-primary-400 text-xs font-semibold leading-none">
                  Campina Grande
                </p>
              </div>
            </div>
          </Link>

          {/* Busca — desktop (sempre visível em md+) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produtos, lojas ou categorias..."
                className="w-full bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-xl px-5 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-primary-400 transition-colors"
              >
                🔍
              </button>
            </div>
          </form>

          {/* Espaço flex no mobile para empurrar ícones para direita */}
          <div className="flex-1 md:hidden" />

          {/* Ícone de busca — mobile */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setMenuOpen(false);
            }}
            aria-label="Abrir busca"
          >
            🔍
          </button>

          {/* Nav — desktop */}
          <nav className="hidden md:flex items-center gap-4 flex-shrink-0">
            <Link
              href="/lojas"
              className="text-white/80 hover:text-primary-400 font-medium transition-colors text-sm"
            >
              Lojas
            </Link>
            <Link href="/auth/login" className="btn-primary text-sm py-2 px-4">
              Sou Lojista
            </Link>
          </nav>

          {/* Hambúrguer — mobile */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
            onClick={() => {
              setMenuOpen(!menuOpen);
              setSearchOpen(false);
            }}
            aria-label="Menu"
          >
            <div className="flex flex-col gap-1.5 w-5">
              <span
                className={`block h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* ── Busca expandida — mobile ──────────────────────────────────────── */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-white/10">
          <form onSubmit={handleSearch} className="pt-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produtos ou lojas..."
                autoFocus
                className="w-full bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70"
              >
                🔍
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Menu mobile ───────────────────────────────────────────────────── */}
      {menuOpen && (
        <nav className="md:hidden border-t border-white/10">
          <div className="px-4 py-3 flex flex-col gap-1">
            <Link
              href="/lojas"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors font-semibold"
            >
              🏪 Todas as lojas
            </Link>
            <Link
              href="/busca"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors font-semibold"
            >
              🔍 Buscar
            </Link>
            <div className="border-t border-white/10 my-1" />
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors font-black text-center justify-center mt-1"
            >
              🏪 Sou Lojista — Entrar
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors font-semibold text-center justify-center"
            >
              ✨ Cadastrar loja grátis
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
