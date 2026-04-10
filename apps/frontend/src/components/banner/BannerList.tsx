"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Banner {
  id: number;
  image_url: string;
  link_url: string | null;
  title: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
}

interface Props {
  banners: Banner[];
  token: string | null;
  onUpdate: (banners: Banner[]) => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function BannerList({
  banners,
  token,
  onUpdate,
  onError,
  onSuccess,
}: Props) {
  const [saving, setSaving] = useState(false);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    // Reordena localmente primeiro — UI responsiva
    const reordered = Array.from(banners);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Atualiza ordem
    const updated = reordered.map((b, index) => ({ ...b, order: index }));
    onUpdate(updated);

    // Salva no backend
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/banners/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: updated.map((b) => ({ id: b.id, order: b.order })),
        }),
      });

      if (res.ok) {
        onSuccess("Ordem dos banners salva!");
      } else {
        onError("Erro ao salvar ordem.");
      }
    } catch {
      onError("Erro ao conectar.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (banner: Banner) => {
    try {
      const res = await fetch(`${API_URL}/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !banner.is_active }),
      });
      if (res.ok) {
        onUpdate(
          banners.map((b) =>
            b.id === banner.id ? { ...b, is_active: !b.is_active } : b,
          ),
        );
      }
    } catch {
      onError("Erro ao atualizar banner.");
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm(`Excluir o banner "${banner.title || "sem título"}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/banners/${banner.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 204) {
        onUpdate(banners.filter((b) => b.id !== banner.id));
        onSuccess("Banner excluído.");
      }
    } catch {
      onError("Erro ao excluir banner.");
    }
  };

  if (banners.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-4xl mb-3">🖼️</p>
        <p>Nenhum banner cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Instrução */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-400 flex items-center gap-1">
          ⠿ Arraste para reordenar
        </p>
        {saving && (
          <p className="text-xs text-orange-500 font-semibold">Salvando...</p>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="banners">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="divide-y divide-gray-50"
            >
              {banners.map((banner, index) => (
                <Draggable
                  key={banner.id}
                  draggableId={String(banner.id)}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-4 p-4 transition-colors ${
                        snapshot.isDragging
                          ? "bg-orange-50 shadow-lg rounded-xl"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Handle de drag */}
                      <div
                        {...provided.dragHandleProps}
                        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0 select-none"
                        title="Arrastar para reordenar"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <circle cx="5" cy="4" r="1.5" />
                          <circle cx="11" cy="4" r="1.5" />
                          <circle cx="5" cy="8" r="1.5" />
                          <circle cx="11" cy="8" r="1.5" />
                          <circle cx="5" cy="12" r="1.5" />
                          <circle cx="11" cy="12" r="1.5" />
                        </svg>
                      </div>

                      {/* Número de ordem */}
                      <div className="w-6 text-center text-xs font-bold text-gray-400 flex-shrink-0">
                        {index + 1}
                      </div>

                      {/* Preview */}
                      <div className="relative w-24 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={banner.image_url}
                          alt={banner.title ?? "Banner"}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {banner.title || "Sem título"}
                        </p>
                        {banner.link_url && (
                          <p className="text-gray-400 text-xs truncate mt-0.5">
                            {banner.link_url}
                          </p>
                        )}
                        <p className="text-gray-400 text-xs mt-0.5">
                          {formatDate(banner.created_at)}
                        </p>
                      </div>

                      {/* Status + ações */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            banner.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {banner.is_active ? "● Ativo" : "● Inativo"}
                        </span>
                        <button
                          onClick={() => handleToggle(banner)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                        >
                          {banner.is_active ? "Pausar" : "Ativar"}
                        </button>
                        <button
                          onClick={() => handleDelete(banner)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
