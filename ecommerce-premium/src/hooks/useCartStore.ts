import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "../types/index";

// 1. Definimos el contrato de la tienda (Estado y Acciones)
interface CartState {
  cart: CartItem[]; // Array de productos en el carrito
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

// 2. Creamos la tienda usando Zustand y el middleware 'persist'
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Estado inicial: el carrito empieza vacío
      cart: [],

      // Acción: Añadir un producto al carrito
      addToCart: (product) =>
        set((state) => {
          // Buscamos si el producto ya está en el carrito usando su ID
          const existingItem = state.cart.find(
            (item) => item.id === product.id,
          );

          if (existingItem) {
            // Si ya existe, recorremos el carrito y sumamos 1 a su cantidad
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          // Si es un producto nuevo, lo agregamos al array con cantidad inicial de 1
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),

      // Acción: Eliminar un producto por completo del carrito
      removeFromCart: (productId) =>
        set((state) => ({
          // Filtramos para dejar fuera el ID que queremos borrar
          cart: state.cart.filter((item) => item.id !== productId),
        })),

      // Acción: Cambiar la cantidad directamente (ej. desde un selector + o -)
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId
              ? { ...item, quantity: Math.max(1, quantity) } // Math.max evita cantidades menores a 1
              : item,
          ),
        })),

      // Acción: Vaciar el carrito (lo usaremos después de un pago exitoso)
      clearCart: () => set({ cart: [] }),

      // Función de ayuda: Calcular el precio total actual
      getTotalPrice: () => {
        // 'get()' nos permite leer el estado actual de la tienda
        return get().cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      // El middleware 'persist' guarda automáticamente el estado en el LocalStorage.
      // Si el usuario refresca la página, ¡los productos del carrito siguen ahí!
      name: "shopping-cart-storage",
    },
  ),
);
