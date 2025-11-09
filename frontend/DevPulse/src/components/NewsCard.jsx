import React from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import '../styles/NewsCard.css';

function NewsCard({ article, index, onCardClick }) {
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

  // Parse categories if string
  let categories = [];
  try {
    if (typeof article.categories === 'string') {
      categories = JSON.parse(article.categories);
    } else if (Array.isArray(article.categories)) {
      categories = article.categories;
    }
  } catch (e) {
    console.warn('Failed to parse categories for article:', article.title, e);
    categories = [];
  }

  // Map backend categories to frontend categories
  const categoryMap = {
    'AI': 'Tech',
    'Technology': 'Tech',
    'Startups': 'Business',
    'Funding': 'Business',
    'Business': 'Business',
    'Research': 'Papers',
    'Patent': 'Patents'
  };

  const displayCategories = categories
    .map(cat => categoryMap[cat] || cat)
    .filter((cat, idx, arr) => arr.indexOf(cat) === idx) // Remove duplicates
    .slice(0, 2); // Limit to 2 categories

  return (
    <motion.article
      className="news-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.5,
        ease: 'easeOut'
      }}
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onCardClick && onCardClick(article)}
      style={{ cursor: 'pointer' }}
    >
      <div className="news-card-header">
        <h3 className="news-card-title">{article.title}</h3>
        {displayCategories.length > 0 && (
          <div className="news-card-categories">
            {displayCategories.map((cat) => (
              <span key={cat} className="category-badge">
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="news-card-summary">
        {article.summary || article.text?.substring(0, 200) + '...'}
      </p>

      <div className="news-card-footer">
        <div className="news-card-meta">
          <span className="news-card-source">{article.source}</span>
          <span className="news-card-date">
            <FiClock /> {formatDate(article.published)}
          </span>
        </div>
        <button
          className="news-card-link"
          onClick={(e) => {
            e.stopPropagation();
            onCardClick && onCardClick(article);
          }}
        >
          Read Summary <FiExternalLink />
        </button>
      </div>
    </motion.article>
  );
}

export default NewsCard;
