import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import '../styles/Header.css';

const CATEGORIES = ['All', 'Business', 'Tech', 'Papers', 'Patents'];

function Header({ selectedCategory, onCategoryChange, searchTerm, onSearchChange, onMenuToggle, isMenuOpen }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header 
      className="header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="header-container">
        {/* Logo - Removed, using site heading instead */}
        <div className="logo-placeholder"></div>

        {/* Category Tabs - Desktop */}
        <nav className="nav-tabs desktop-only">
          {CATEGORIES.map((category) => (
            <motion.button
              key={category}
              className={`nav-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
              {selectedCategory === category && (
                <motion.div
                  className="tab-indicator"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="header-actions">
          {/* Search */}
          <motion.div 
            className="search-container"
            whileFocus={{ scale: 1.05 }}
          >
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </motion.div>

          {/* Theme Toggle */}
          <motion.button
            className="theme-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </motion.button>

          {/* Mobile Menu Toggle */}
          <motion.button
            className="menu-toggle mobile-only"
            onClick={onMenuToggle}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Category Tabs */}
      <motion.nav 
        className={`nav-tabs mobile-nav ${isMenuOpen ? 'open' : ''}`}
        initial={false}
        animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {CATEGORIES.map((category) => (
          <motion.button
            key={category}
            className={`nav-tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => {
              onCategoryChange(category);
              onMenuToggle();
            }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </motion.nav>
    </motion.header>
  );
}

export default Header;

