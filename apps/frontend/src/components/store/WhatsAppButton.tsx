"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Props {
  whatsappUrl: string;
  storeId: number;
  label?: string;
  className?: string;
}

// ─── WhatsAppButton ───────────────────────────────────────────────────────────
// Registra o clique no backend antes de abrir o WhatsApp.
// Fire-and-forget — não bloqueia a abertura do WhatsApp se o backend falhar.

export default function WhatsAppButton({
  whatsappUrl,
  storeId,
  label = "Falar no WhatsApp",
  className = "",
}: Props) {
  const handleClick = () => {
    // Registra o evento em background — não aguarda resposta
    fetch(`${API_URL}/public/stores/${storeId}/events/whatsapp`, {
      method: "POST",
    }).catch(() => {}); // ignora erros silenciosamente
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      <span>💬</span>
      <span>{label}</span>
    </a>
  );
}
