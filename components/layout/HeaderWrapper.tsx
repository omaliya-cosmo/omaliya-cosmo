'use client';

import { useState, useEffect } from 'react';
import Header from './Header';

export default function HeaderWrapper() {
  const [userData, setUserData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // This is a placeholder for actual API calls
        // In a real app, you would fetch user data from an API endpoint
        // For now, we'll simulate some data
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
        
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const cart = JSON.parse(storedCart);
          setCartCount(cart.length || 0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Return the Header component with the required props
  return <Header userData={userData} cartCount={cartCount} />;
}