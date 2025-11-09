import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiTrendingUp, FiZap, FiTarget } from 'react-icons/fi';
import '../styles/HomeHero.css';

function HomeHero({ onExploreClick = () => {} }) {
  return (
    <section className="home-hero">
      <div className="hero-background">
        <div className="hero-gradient" />
        <div className="hero-pattern" />
      </div>

      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Stay Ahead with
          <br />
          <span className="gradient-text">Dev Pulse</span>
        </motion.h1>

        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Curated tech news, startup insights, and research papers
          <br />
          powered by AI to keep you informed and inspired
        </motion.p>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="stat-item">
            <FiTrendingUp className="stat-icon" />
            <div>
              <div className="stat-number">100+</div>
              <div className="stat-label">Articles Daily</div>
            </div>
          </div>
          <div className="stat-item">
            <FiZap className="stat-icon" />
            <div>
              <div className="stat-number">AI</div>
              <div className="stat-label">Powered</div>
            </div>
          </div>
          <div className="stat-item">
            <FiTarget className="stat-icon" />
            <div>
              <div className="stat-number">4</div>
              <div className="stat-label">Categories</div>
            </div>
          </div>
        </motion.div>

        <motion.button
          className="hero-cta"
          onClick={onExploreClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Explore Articles <FiArrowRight />
        </motion.button>
      </motion.div>

      {/* <div className="hero-scroll-indicator">
        <motion.div
          className="scroll-arrow"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div> */}
    </section>
  );
}

export default HomeHero;

