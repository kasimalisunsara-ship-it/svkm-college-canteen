import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { addToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('campus_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  const addToCart = (food, qty = 1) => {
    if (!food.isAvailable) {
      addToast(`'${food.name}' is currently unavailable.`, 'warning');
      return;
    }

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.foodId === food.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [
          ...prev,
          {
            foodId: food.id,
            name: food.name,
            price: Number(food.price),
            image: food.image,
            categoryName: food.categoryName,
            isAvailable: food.isAvailable,
            quantity: qty
          }
        ];
      }
    });

    addToast(`Added ${food.name} to cart!`, 'success');
  };

  const removeFromCart = (foodId) => {
    setCartItems(prev => {
      const item = prev.find(i => i.foodId === foodId);
      if (item) {
        addToast(`Removed ${item.name} from cart.`, 'info');
      }
      return prev.filter(i => i.foodId !== foodId);
    });
  };

  const updateQuantity = (foodId, delta) => {
    setCartItems(prev => {
      return prev
        .map(item => {
          if (item.foodId === foodId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null; // mark for removal
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const setItemQuantity = (foodId, qty) => {
    if (qty <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCartItems(prev => {
      return prev.map(item => item.foodId === foodId ? { ...item, quantity: qty } : item);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('campus_cart');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      setItemQuantity,
      clearCart,
      cartCount,
      cartSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
