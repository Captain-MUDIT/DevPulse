import React from 'react';
import { motion } from 'framer-motion';
import NewsCard from './NewsCard';
import '../styles/NewsGrid.css';

function NewsGrid({ articles, onCardClick }) {
  if (articles.length === 0) {
    return (
      <motion.div 
        className="empty-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p>No articles found. Try adjusting your filters.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="news-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {articles.map((article, index) => (
        <NewsCard key={article.id} article={article} index={index} onCardClick={onCardClick} />
      ))}
    </motion.div>
  );
}

export default NewsGrid;
