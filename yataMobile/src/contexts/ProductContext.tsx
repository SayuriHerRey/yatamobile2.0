// src/contexts/ProductContext.tsx
// Conectado al microservicio Product (FastAPI en puerto 8001)
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  CustomizableProduct,
  IngredientOption,
  SizeOption,
  ExtraOption,
} from '../types';
import { API_URLS } from '../config/apiConfig';

// ─── Tipos que devuelve el microservicio ──────────────────────────────────────
interface ApiIngredient { id: string; name: string; removable: boolean }
interface ApiSize       { id: string; name: string; price: number }
interface ApiExtra      { id: string; name: string; price: number }

interface ApiProduct {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  image_url: string;
  available: boolean;
  requires_customization: boolean;
  has_extras: boolean;
  base_ingredients: ApiIngredient[];
  available_sizes: ApiSize[];
  available_extras: ApiExtra[];
}

// ─── Conversión API → tipo del front ─────────────────────────────────────────
function mapApiProduct(p: ApiProduct): CustomizableProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    basePrice: p.base_price,
    image: p.image_url,
    available: p.available,
    category: p.category,
    requiresCustomization: p.requires_customization,
    hasExtras: p.has_extras,
    baseIngredients: p.base_ingredients,
    availableSizes: p.available_sizes,
    availableExtras: p.available_extras,
  };
}

// ─── Contexto ─────────────────────────────────────────────────────────────────
interface ProductContextType {
  products: CustomizableProduct[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<CustomizableProduct, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<CustomizableProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  getProductById: (id: string) => CustomizableProduct | undefined;
  getProductsByCategory: (category: string) => CustomizableProduct[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts debe usarse dentro de ProductProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<CustomizableProduct[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const BASE = `${API_URLS.PRODUCT_SERVICE}/products`;

  // ── Cargar todos los productos disponibles ──────────────────────────────────
  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}?available_only=false`);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data: ApiProduct[] = await res.json();
      setProducts(data.map(mapApiProduct));
    } catch (e: any) {
      setError(e.message ?? 'No se pudo conectar al servidor de productos');
      console.error('❌ ProductContext.refreshProducts:', e);
    } finally {
      setLoading(false);
    }
  }, [BASE]);

  useEffect(() => { refreshProducts(); }, [refreshProducts]);

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const addProduct = async (p: Omit<CustomizableProduct, 'id'>) => {
    const body = {
      name: p.name,
      description: p.description,
      base_price: p.basePrice,
      category: p.category,
      image_url: p.image,
      available: p.available,
      requires_customization: p.requiresCustomization,
      has_extras: p.hasExtras ?? false,
      base_ingredients: p.baseIngredients,
      available_sizes: p.availableSizes,
      available_extras: p.availableExtras,
    };
    const res = await fetch(BASE + '/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Error al crear producto: ${res.status}`);
    const created: ApiProduct = await res.json();
    setProducts(prev => [...prev, mapApiProduct(created)]);
  };

  const updateProduct = async (id: string, updates: Partial<CustomizableProduct>) => {
    // Solo mapeamos los campos que el back acepta en el PATCH/PUT
    const body: Record<string, any> = {};
    if (updates.name        !== undefined) body.name        = updates.name;
    if (updates.description !== undefined) body.description = updates.description;
    if (updates.basePrice   !== undefined) body.base_price  = updates.basePrice;
    if (updates.category    !== undefined) body.category    = updates.category;
    if (updates.image       !== undefined) body.image_url   = updates.image;
    if (updates.available   !== undefined) body.available   = updates.available;
    if (updates.requiresCustomization !== undefined)
      body.requires_customization = updates.requiresCustomization;
    if (updates.hasExtras !== undefined) body.has_extras = updates.hasExtras;

    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Error al actualizar producto: ${res.status}`);
    const updated: ApiProduct = await res.json();
    setProducts(prev =>
      prev.map(p => (p.id === id ? mapApiProduct(updated) : p))
    );
  };

  const deleteProduct = async (id: string) => {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Error al eliminar producto: ${res.status}`);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleAvailability = async (id: string) => {
    const res = await fetch(`${BASE}/${id}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error(`Error al cambiar disponibilidad: ${res.status}`);
    const updated: ApiProduct = await res.json();
    setProducts(prev =>
      prev.map(p => (p.id === id ? mapApiProduct(updated) : p))
    );
  };

  // ── Helpers síncronos ───────────────────────────────────────────────────────
  const getProductById      = (id: string) => products.find(p => p.id === id);
  const getProductsByCategory = (cat: string) =>
    products.filter(p => p.category === cat && p.available);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleAvailability,
        getProductById,
        getProductsByCategory,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};