const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
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
  getStore: (id: number) => fetchAPI<StoreDetail>(`/public/stores/${id}`),
  getProduct: (storeId: number, productId: number) =>
    fetchAPI<Product>(`/public/stores/${storeId}/products/${productId}`),
  search: (q: string) => fetchAPI<SearchResult>(`/public/search?q=${q}`),
  getBanners: () =>
    fetchAPI<Banner[]>("/public/banners", { cache: "no-store" }),
};

// Tipos
export interface Store {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  segment: string | null;
  location: string | null;
  whatsapp: string | null;
  instagram: string | null;
  logo_url: string | null;
  cover_url: string | null;
  is_open: boolean;
  plan: "gratis" | "basico" | "premium";
}

export interface Product {
  id: number;
  store_id: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  sizes: string | null;
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

export interface Banner {
  id: number;
  image_url: string;
  link_url: string | null;
  title: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
}
