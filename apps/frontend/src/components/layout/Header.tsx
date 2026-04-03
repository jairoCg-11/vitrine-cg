"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(search)}`;
    }
  };

  return (
    <header className="bg-shopping-dark text-white sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-xl font-black">
                V
              </div>
              <div>
                <p className="font-black text-lg leading-none">Vitrine</p>
                <p className="text-primary-400 text-xs font-semibold leading-none">
                  Campina Grande
                </p>
              </div>
            </div>
          </Link>

          {/* Busca */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produtos, lojas ou categorias..."
                className="w-full bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-xl px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-primary-400 transition-colors"
              >
                🔍
              </button>
            </div>
          </form>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-4 flex-shrink-0">
            <Link
              href="/lojas"
              className="text-white/80 hover:text-primary-400 font-medium transition-colors"
            >
              Lojas
            </Link>
            <Link
              href="/auth/login"
              className="btn-primary text-sm py-2"
            >
              Sou Lojista
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
