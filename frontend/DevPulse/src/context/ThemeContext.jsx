import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      // Check localStorage first, then system preference
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved) {
          console.log('Theme loaded from localStorage:', saved);
          return saved;
        }
        if (window.matchMedia) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          console.log('Theme from system preference:', prefersDark ? 'dark' : 'light');
          return prefersDark ? 'dark' : 'light';
        }
      }
      console.log('Using default theme: light');
      return 'light';
    } catch (e) {
      console.error('Error initializing theme:', e);
      return 'light';
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
      }
    } catch (e) {
      console.error('Error setting theme:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

