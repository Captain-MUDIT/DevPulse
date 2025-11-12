import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiExternalLink, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import '../styles/ArticleModal.css';

function ArticleModal({ article, isOpen, onClose }) {
  if (!article) return null;

  // Handle Escape key to close modal and manage body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // Prevent body scroll when modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);

      return () => {
        // Always restore scroll when modal closes
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = originalOverflow || 'unset';
      };
    } else {
      // Ensure scroll is restored when modal is closed
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

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

  const categoryMap = {
    'AI': 'Tech',
    'Technology': 'Tech',
    'Startups': 'Business',
    'Funding': 'Business',
    'Business': 'Business',
    'Papers' : 'Papers',
    'Research': 'Papers',
    'Patent': 'Patents',
    'Patents': 'Patents',
  };

  const displayCategories = categories
    .map(cat => categoryMap[cat] || cat)
    .filter((cat, idx, arr) => arr.indexOf(cat) === idx);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <FiX />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">{article.title}</h2>
              {displayCategories.length > 0 && (
                <div className="modal-categories">
                  {displayCategories.map((cat) => (
                    <span key={cat} className="category-badge">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
              <div className="modal-meta">
                <span className="modal-source">{article.source}</span>
                <span className="modal-date">
                  <FiClock /> {formatDate(article.published)}
                </span>
              </div>
            </div>

            <div className="modal-body">
              {article.summary && (
                <div className="modal-summary">
                  <h3>Summary</h3>
                  <p>{article.summary}</p>
                </div>
              )}

              {article.text && (
                <div className="modal-full-text">
                  {article.summary && <h3>Full Article</h3>}
                  <p>{article.text}</p>
                </div>
              )}

              {!article.summary && !article.text && (
                <div className="modal-summary">
                  <p>No content available for this article.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link"
              >
                Read Full Article <FiExternalLink />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ArticleModal;

