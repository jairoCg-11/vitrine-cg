const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Erro na API: ${res.status}`);
  }

  return res.json();
}

// Rotas públicas
export const publicAPI = {
  getStores: () => fetchAPI<Store[]>("/public/stores"),
  getStore:  (id: number) => fetchAPI<StoreDetail>(`/public/stores/${id}`),
  search:    (q: string) => fetchAPI<SearchResult>(`/public/search?q=${q}`),
};

// Tipos
export interface Store {
  id: number;
  name: string;
  description: string | null;
  segment: string | null;
  location: string | null;
  whatsapp: string | null;
  instagram: string | null;
  logo_url: string | null;
  cover_url: string | null;
  is_open: boolean;
}

export interface Product {
  id: number;
  store_id: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
}

export interface StoreDetail extends Store {
  products: Product[];
}

export interface SearchResult {
  stores: Store[];
  products: Product[];
}
