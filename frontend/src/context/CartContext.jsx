import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get user token
  const getUserToken = () => localStorage.getItem('user_token');

  // Fetch cart from backend
  const fetchCart = async () => {
    const token = getUserToken();
    if (!token) {
      setCart([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart on mount and when token changes
  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (item) => {
    const token = getUserToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await axios.post(`${API}/cart/add`, item, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh cart
      await fetchCart();
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to add to cart' };
    }
  };

  const removeFromCart = async (itemId) => {
    const token = getUserToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      await axios.delete(`${API}/cart/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh cart
      await fetchCart();
      
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to remove from cart' };
    }
  };

  const toggleItemSelection = async (itemId) => {
    const token = getUserToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      await axios.put(`${API}/cart/item/${itemId}/toggle-select`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh cart
      await fetchCart();
      
      return { success: true };
    } catch (error) {
      console.error('Error toggling item selection:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to toggle item' };
    }
  };

  const enquireSelectedItems = async () => {
    const token = getUserToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await axios.post(`${API}/cart/enquire-selected`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error enquiring items:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to send enquiry' };
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      toggleItemSelection,
      enquireSelectedItems,
      clearCart, 
      cartCount: cart.length,
      loading,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);