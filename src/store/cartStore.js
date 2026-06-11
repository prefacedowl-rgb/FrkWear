import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (item) => set((state) => {
        // item should have: id, name, price, size, color, qty, imageUrl
        const existingIndex = state.items.findIndex(
          (i) => i.id === item.id && i.size === item.size && i.color === item.color
        );

        if (existingIndex > -1) {
          const newItems = [...state.items];
          newItems[existingIndex].qty += item.qty || 1;
          return { items: newItems };
        } else {
          return { items: [...state.items, { ...item, qty: item.qty || 1 }] };
        }
      }),

      removeItem: (id, size, color) => set((state) => ({
        items: state.items.filter(
          (i) => !(i.id === id && i.size === size && i.color === color)
        )
      })),

      updateQty: (id, size, color, qty) => set((state) => ({
        items: state.items.map((i) =>
          (i.id === id && i.size === size && i.color === color) ? { ...i, qty: Math.max(1, qty) } : i
        )
      })),

      clearCart: () => set({ items: [] }),
      
      toggleCart: (isOpen) => set((state) => ({
        isCartOpen: typeof isOpen === 'boolean' ? isOpen : !state.isCartOpen
      })),

      // Helper properties (computed via functions)
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.qty), 0);
      },

      isEligibleForFreeShipping: () => {
        return get().getTotalPrice() >= 999;
      }
    }),
    {
      name: 'frkwear-cart-store'
    }
  )
)
