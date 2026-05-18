interface Props {
  price: string | number;
  originalPrice?: string | number | null;
  showPrice: boolean;
  size?: "sm" | "md" | "lg";
}

// ─── PriceDisplay ─────────────────────────────────────────────────────────────
// Exibe o preço do produto em 3 modos:
//
// 1. show_price = false → "Consultar preço"
// 2. original_price preenchido → "De R$ X / Por R$ Y" (promoção)
// 3. Normal → "R$ X"

export default function PriceDisplay({
  price,
  originalPrice,
  showPrice,
  size = "md",
}: Props) {
  const formatPrice = (val: string | number) =>
    `R$ ${Number(val).toFixed(2).replace(".", ",")}`;

  const isPromo = originalPrice && Number(originalPrice) > Number(price);

  // Tamanhos
  const sizes = {
    sm: {
      current: "text-base font-black",
      original: "text-xs",
      consult: "text-sm",
    },
    md: {
      current: "text-xl font-black",
      original: "text-sm",
      consult: "text-base",
    },
    lg: {
      current: "text-3xl md:text-4xl font-black",
      original: "text-base",
      consult: "text-lg",
    },
  };

  const s = sizes[size];

  // Modo: preço oculto
  if (!showPrice) {
    return (
      <p className={`${s.consult} text-gray-500 font-semibold italic`}>
        💬 Consultar preço
      </p>
    );
  }

  // Modo: promoção
  if (isPromo) {
    return (
      <div>
        <p className={`${s.original} text-gray-400 line-through`}>
          De {formatPrice(originalPrice!)}
        </p>
        <p className={`${s.current} text-orange-600`}>
          Por {formatPrice(price)}
        </p>
      </div>
    );
  }

  // Modo: preço normal
  return <p className={`${s.current} text-orange-600`}>{formatPrice(price)}</p>;
}
