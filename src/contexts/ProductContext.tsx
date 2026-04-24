// src/contexts/ProductContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CustomizableProduct, ProductCustomization, SizeOption, ExtraOption, IngredientOption } from '../types';

interface ProductContextType {
  products: CustomizableProduct[];
  addProduct: (product: Omit<CustomizableProduct, 'id'>) => void;
  updateProduct: (id: string, product: Partial<CustomizableProduct>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => CustomizableProduct | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

// Datos iniciales mock
const INITIAL_PRODUCTS: CustomizableProduct[] = [
  {
    id: '1',
    name: 'Chilaquiles Verdes',
    description: 'Totopos crujientes bañados en salsa verde tatemada, crema de rancho y queso fresco.',
    basePrice: 65.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxoj5Mk9NmVlotomRnJ6mTaZk_aJ2WduuAe0ZFAvUqpxhTZzfRTc7omWIPNaLVZ0qzo2LgA4eJxuGTJvc4tPWBSp_oOHxIOzByJjbYh36f6AVgEUG0uU4LMondGDcvlvSsuYhgmQ8XDKmVz6kJPPSXtVzZ_tlCdlmv-vtDbrVpYViGWO9qm9gWB56gM6rOIc6agz8JzmgNr02NE_1CBq3FLfr9OiMx-BfUExi73qtTDmzRoESkALbAGqrvGQbdMgLkkSTfJyeND8E',
    available: true,
    category: 'Alimentos',
    requiresCustomization: true,
    hasExtras: true,
    baseIngredients: [
      { id: 'pan', name: 'Totopos', removable: false },
      { id: 'salsa', name: 'Salsa verde', removable: true },
      { id: 'crema', name: 'Crema de rancho', removable: true },
      { id: 'queso', name: 'Queso fresco', removable: true },
    ],
    availableSizes: [
      { id: 'regular', name: 'Regular', price: 0 },
      { id: 'grande', name: 'Grande', price: 15 },
    ],
    availableExtras: [
      { id: 'queso_extra', name: 'Queso extra', price: 10 },
      { id: 'tocino', name: 'Tocino', price: 15 },
      { id: 'pollo', name: 'Pollo deshebrado', price: 20 },
      { id: 'huevo', name: 'Huevo estrellado', price: 12 },
    ],
  },
  {
    id: '2',
    name: 'Bagel de Huevo y Aguacate',
    description: 'Huevo estrellado a la perfección con láminas de aguacate Hass en pan artesanal.',
    basePrice: 55.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCNvD9fJlHOV0COcs3uY4JDoSqinn9G6OBWkcIvLiNGWAlEUnJdo9mM9fX1rrVUbPwBspHuP6D005gZUx7rCBJ_6ZIESXqIcUlfs4NkHlYRA-2CfkuM0Jma78RDtc5G7T-EjY9X1Y280MzH6-wTxF5yOsXPn5x9afvzvMTH_daBQg2VXNOasNqXA0QOktLJAd0h6nhYq2K6oWZknZQgW4tg_5BJc9-Qn6jrm-NIQQ6yLTUDKN67_SiDiakZnGm9yzRbpsRwmCKmYM',
    available: true,
    category: 'Alimentos',
    requiresCustomization: false,
    baseIngredients: [],
    availableSizes: [],
    availableExtras: [],
  },
  {
    id: '3',
    name: 'Cuernito de Chocolate',
    description: 'Croissant de mantequilla relleno de ganache de chocolate belga 70% cacao.',
    basePrice: 38.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVH8N0IBzjsY6BVs32DbN2QNRcFROedd3bieFOf2SE2DMg5pmt_T0-uqAc45V6z5aJeP5DMUBD4fHqnX7S1ScyBqcV-_1luoW9tWDPFgQXOoHyp_Vr9WnDrsk_zjEhB4zPYHvd6xyvmpn5J_onv5LQ4m1ubMzc3aX_PwRTkds7fmtoW0nhD5zTIIA-ck1a2z-FbuBnH0688Pw4DaNj3ltoXn37b6CSQpFK_-G1VwKghDxVUA_9ZecCKctHhjHuSuiDVsGIIeoDQ34',
    available: false,
    category: 'Snacks',
    requiresCustomization: false,
    baseIngredients: [],
    availableSizes: [],
    availableExtras: [],
  },
  {
    id: '4',
    name: 'Bowl Académico',
    description: 'Mezcla energética de quinoa, garbanzos rostizados, espinaca y aderezo tahini.',
    basePrice: 72.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFkCOtcnuePaxUsOWK-rr1bl8z5il00X0Y7bDGmHb-JpMNaLy2WYnVHg5CAP3vW2iSeaiCX2Wbf53RmGl-GeEJYO6GkL6qkiDLg-9jqGM6GVGbD9NKdwveUVau1FosPnZ0bW_8Vrm64N9bqXQCzSV_LHXsJumZNrnCPJNUXnQf5wIvpDZW4WcWusmikkgMo-72Tf_eVvqFxf0Eb8o9C5DUNiXYmKXbXkiS1NceCBZWFRoyiyAFVNsy06wUbQrB1J33sMlLSWmjcJg',
    available: true,
    category: 'Alimentos',
    requiresCustomization: true,
    hasExtras: true,
    baseIngredients: [
      { id: 'quinoa', name: 'Quinoa', removable: true },
      { id: 'garbanzos', name: 'Garbanzos rostizados', removable: true },
      { id: 'espinaca', name: 'Espinaca', removable: true },
      { id: 'tahini', name: 'Aderezo tahini', removable: true },
    ],
    availableSizes: [
      { id: 'regular', name: 'Regular', price: 0 },
      { id: 'grande', name: 'Grande', price: 20 },
    ],
    availableExtras: [
      { id: 'pollo', name: 'Pollo grillé', price: 25 },
      { id: 'falafel', name: 'Falafel', price: 18 },
      { id: 'hummus', name: 'Hummus extra', price: 12 },
      { id: 'semillas', name: 'Semillas de chía', price: 8 },
    ],
  },
];

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<CustomizableProduct[]>(INITIAL_PRODUCTS);

  const addProduct = (productData: Omit<CustomizableProduct, 'id'>) => {
    const newProduct: CustomizableProduct = {
      ...productData,
      id: `product-${Date.now()}`,
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<CustomizableProduct>) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, ...updates } : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const value: ProductContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};