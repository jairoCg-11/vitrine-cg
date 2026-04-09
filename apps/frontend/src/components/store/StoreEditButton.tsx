"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

interface Props {
  storeId: number;
  ownerId: number;
}

export default function StoreEditButton({ storeId, ownerId }: Props) {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Não renderiza no SSR nem enquanto carrega
  if (!mounted || isLoading) return null;

  // Só mostra para o dono da loja logado como lojista
  if (!user || user.role !== "lojista" || user.id !== ownerId) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-50 flex flex-col gap-2">
      <Link
        href="/dashboard/loja/editar"
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-3 rounded-2xl shadow-xl transition-all hover:scale-105 text-sm"
      >
        ✏️ <span className="hidden sm:inline">Editar loja</span>
      </Link>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 bg-shopping-dark hover:bg-shopping-medium text-white font-bold px-4 py-3 rounded-2xl shadow-xl transition-all hover:scale-105 text-sm"
      >
        📊 <span className="hidden sm:inline">Dashboard</span>
      </Link>
    </div>
  );
}
