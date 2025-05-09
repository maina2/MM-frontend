import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '../types/index';

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: (() => {
    try {
      const cartData = localStorage.getItem('cart');
      return cartData ? JSON.parse(cartData) : [];
    } catch {
      return [];
    }
  })(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.product.id === product.id);
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
      if (newQuantity > product.stock) {
        return; // Optionally, dispatch a notification in the future
      }
      if (existingItem) {
        existingItem.quantity = newQuantity;
      } else {
        state.items.push({ product, quantity });
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.product.id === productId);
      if (item && quantity > 0) {
        if (quantity > item.product.stock) {
          return; // Optionally, dispatch a notification
        }
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(state.items));
      } else if (item && quantity <= 0) {
        state.items = state.items.filter((item) => item.product.id !== productId);
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;