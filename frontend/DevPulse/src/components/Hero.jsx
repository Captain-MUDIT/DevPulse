import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiExternalLink } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import '../styles/Hero.css';

function Hero({ articles, onCardClick }) {
  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'Recently';
    }
  };

  // Get top 3-4 articles for hero
  const heroArticles = articles.slice(0, 4);

  if (heroArticles.length === 0) return null;

  return (
    <section className="hero">
      <motion.div
        className="hero-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 
          className="hero-title"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Today's Highlights
        </motion.h2>
        
        <div className="hero-grid">
          {heroArticles.map((article, index) => (
            <motion.article
              key={article.id}
              className="hero-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCardClick && onCardClick(article)}
              style={{ cursor: 'pointer' }}
            >
              <div className="hero-card-content">
                <h3 className="hero-card-title">{article.title}</h3>
                <p className="hero-card-summary">
                  {article.summary || article.text?.substring(0, 150) + '...'}
                </p>
                <div className="hero-card-meta">
                  <span className="hero-card-source">{article.source}</span>
                  <span className="hero-card-date">
                    {formatDate(article.published)}
                  </span>
                </div>
                <button
                  className="hero-card-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCardClick && onCardClick(article);
                  }}
                >
                  Read Summary <FiExternalLink />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default Hero;

