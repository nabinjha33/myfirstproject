"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface CartItem {
  id: string;
  product: any;
  variant: any;
  quantity: number;
  note: string;
}

const useCart = (cartKey: string): {
  cart: CartItem[];
  addToCart: (product: any, variant: any, quantity?: number, note?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNote: (itemId: string, note: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
} => {
  const [cart, setCart] = useState([]);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const localCart = window.localStorage.getItem(cartKey);
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    } catch (error) {
      console.error(`Error reading ${cartKey} from localStorage`, error);
    }
  }, [cartKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch (error) {
      console.error(`Error writing ${cartKey} to localStorage`, error);
    }
  }, [cart, cartKey]);

  const addToCart = useCallback((product, variant, quantity = 1, note = '') => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => 
        item.product.id === product.id && item.variant.id === variant.id
      );
      
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        if (note && note.trim()) {
          updatedCart[existingItemIndex].note = note;
        }
        return updatedCart;
      } else {
        return [...prevCart, { 
          id: `${product.id}_${variant.id}_${Date.now()}`,
          product, 
          variant, 
          quantity, 
          note: note || ''
        }];
      }
    });
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    setCart(prevCart => {
      if (quantity < 1) {
        return prevCart.filter(item => item.id !== itemId);
      }
      return prevCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  }, []);

  const updateNote = useCallback((itemId, note) => {
    setCart(prevCart => 
      prevCart.map(item =>
        item.id === itemId ? { ...item, note } : item
      )
    );
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      const price = item.variant.estimated_price_npr || 0;
      return total + (price * item.quantity);
    }, 0);
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  return { 
    cart, 
    addToCart, 
    updateQuantity, 
    updateNote,
    removeFromCart, 
    clearCart, 
    getCartTotal,
    getCartItemCount
  };
};

export default useCart;
