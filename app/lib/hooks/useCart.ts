import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export function useCart() {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/cart');
      setCartItems(data.items || []);
      
      const totalItems = data.items?.reduce(
        (sum, item) => sum + item.quantity,
        0
      ) || 0;
      
      setCartCount(totalItems);
      return data;
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message || 'Failed to fetch cart');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    try {
      await axios.post('/api/cart', {
        productId: product.id,
        quantity: 1,
      });

      setCartCount((prev) => prev + 1);
      toast.success(`Added ${product.name} to your cart!`);
      
      // Refresh cart data
      await fetchCartData();
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error(err.message || 'Error adding to cart');
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      await axios.put('/api/cart', {
        productId,
        quantity,
      });
      
      toast.success('Cart updated');
      await fetchCartData();
    } catch (err) {
      console.error('Error updating cart:', err);
      toast.error(err.message || 'Error updating cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`/api/cart?productId=${productId}`);
      
      toast.success('Item removed from cart');
      await fetchCartData();
    } catch (err) {
      console.error('Error removing from cart:', err);
      toast.error(err.message || 'Error removing from cart');
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart/clear');
      
      toast.success('Cart cleared');
      await fetchCartData();
    } catch (err) {
      console.error('Error clearing cart:', err);
      toast.error(err.message || 'Error clearing cart');
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  return {
    cartItems,
    cartCount,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: fetchCartData
  };
}