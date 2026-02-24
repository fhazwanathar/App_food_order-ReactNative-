// src/context/AppContext.js
import { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // State Management
  const [cart, setCart] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Guest User',
    email: '',
    phone: '',
    memberSince: new Date().toISOString(),
    totalOrders: 0,
    totalSpent: 0,
  });
  const [notifications, setNotifications] = useState([]);

  // Update user stats saat order history berubah
  useEffect(() => {
    const totalOrders = orderHistory.length;
    const totalSpent = orderHistory.reduce((sum, order) => sum + order.total, 0);
    
    setUserProfile(prev => ({
      ...prev,
      totalOrders,
      totalSpent,
    }));
  }, [orderHistory]);

  // Add notification
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [notification, ...prev]);
  };

  // Clear notification
  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Add to cart
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    
    addNotification(`${item.name} ditambahkan ke keranjang`, 'success');
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
    addNotification('Item dihapus dari keranjang', 'info');
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Toggle favorite
  const toggleFavorite = (itemId) => {
    if (favorites.includes(itemId)) {
      setFavorites(favorites.filter(id => id !== itemId));
      addNotification('Dihapus dari favorit', 'info');
    } else {
      setFavorites([...favorites, itemId]);
      addNotification('Ditambahkan ke favorit ❤️', 'success');
    }
  };

  // Add order to history
  const addOrder = (order) => {
    setOrderHistory([order, ...orderHistory]);
    clearCart();
    addNotification('Pesanan berhasil dibuat!', 'success');
  };

  // Re-order
  const reorder = (order) => {
    const itemsToAdd = order.items.map(item => ({
      ...item,
      quantity: item.quantity,
    }));
    setCart(itemsToAdd);
    addNotification('Pesanan ditambahkan ke keranjang', 'success');
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    // State
    cart,
    orderHistory,
    favorites,
    isDarkMode,
    userProfile,
    notifications,
    
    // Functions
    addToCart,
    removeFromCart,
    clearCart,
    toggleFavorite,
    addOrder,
    reorder,
    toggleDarkMode,
    setUserProfile,
    addNotification,
    clearNotification,
    setCart,
    setOrderHistory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};