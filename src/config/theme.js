// src/config/theme.js

const defaultFonts = {
  regular: { fontFamily: 'System', fontWeight: '400' },
  medium:  { fontFamily: 'System', fontWeight: '500' },
  bold:    { fontFamily: 'System', fontWeight: '700' },
  heavy:   { fontFamily: 'System', fontWeight: '900' },
};

export const lightTheme = {
  dark: false,
  colors: {
    primary: '#FF6347',
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#1a1a1a',
    border: '#eeeeee',
    notification: '#ff4444',
  },
  fonts: defaultFonts,
  // Backward compatibility & Custom tokens
  primary: '#FF6347',
  textSecondary: '#666666',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#f44336',
  info: '#2196F3',
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: '#FF6347',
    background: '#0a0a0a',
    card: '#161616',
    text: '#f0f0f0',
    border: 'rgba(255,255,255,0.1)',
    notification: '#ff4444',
  },
  fonts: defaultFonts,
  // Backward compatibility & Custom tokens
  primary: '#FF6347',
  textSecondary: '#999999',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#f44336',
  info: '#2196F3',
};

