import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { fetchArticles } from './api/articles';
import Header from './components/Header';
import HomeHero from './components/HomeHero';
import FeaturesSection from './components/FeaturesSection';
import Hero from './components/Hero';
import NewsGrid from './components/NewsGrid';
import Footer from './components/Footer';
import ArticleModal from './components/ArticleModal';
import './styles/App.css';

const CATEGORY_MAP = {
  'All': null,
  'Business': ['Business', 'Startups', 'Funding'],
  'Tech': ['AI', 'Technology'],
  'Papers': ['Research'],
  'Patents': ['Patent']
};

function App() {
  console.log('App component rendering...');
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const contentRef = useRef(null);
  const searchResultsRef = useRef(null);
  
  console.log('App state initialized');

  useEffect(() => {
    console.log('App mounted, starting article load...');
    // Delay initial load slightly to ensure UI renders first
    const timer = setTimeout(() => {
      loadArticles();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const loadArticles = async () => {
    try {
      console.log('Loading articles...');
      setLoading(true);
      setError(null);
      const data = await fetchArticles(50); // Fetch more for filtering
      console.log('Articles loaded:', data?.length || 0);
      setArticles(data || []); // Ensure it's always an array
    } catch (err) {
      console.error('Error loading articles:', err);
      setError('Failed to load articles. Please try again later.');
      setArticles([]); // Set empty array on error
    } finally {
      setLoading(false);
      console.log('Loading complete');
    }
  };

  // Filter articles based on category and search
  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    // Filter by category
    if (selectedCategory !== 'All') {
      const categoryKeywords = CATEGORY_MAP[selectedCategory];
      filtered = filtered.filter(article => {
        let categories = [];
        try {
          if (typeof article.categories === 'string') {
            categories = JSON.parse(article.categories);
          } else if (Array.isArray(article.categories)) {
            categories = article.categories;
          }
        } catch (e) {
          console.warn('Failed to parse categories:', e);
          categories = [];
        }
        
        return categoryKeywords && categoryKeywords.some(keyword => 
          categories.some(cat => cat && cat.includes(keyword))
        );
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(article => 
        article.title?.toLowerCase().includes(term) ||
        article.summary?.toLowerCase().includes(term) ||
        article.text?.toLowerCase().includes(term) ||
        article.source?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [articles, selectedCategory, searchTerm]);

  // Separate hero articles from grid articles
  const heroArticles = filteredArticles.slice(0, 4);
  const gridArticles = filteredArticles.slice(4);

  const handleCardClick = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    // Ensure body scroll is restored
    document.body.style.overflow = 'unset';
  };

  const handleExploreClick = () => {
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Scroll to search results when search term changes
  useEffect(() => {
    if (searchTerm && searchResultsRef.current) {
      // Use a longer timeout to ensure DOM has fully updated with filtered results
      setTimeout(() => {
        const element = searchResultsRef.current;
        if (element) {
          // Calculate the scroll position accounting for sticky headers
          const headerHeight = document.querySelector('.site-heading')?.offsetHeight || 100;
          const navHeight = document.querySelector('.header')?.offsetHeight || 70;
          const totalStickyHeight = headerHeight + navHeight + 10; // add 10px buffer
          
          // Get the element's position relative to the viewport and document
          const elementRect = element.getBoundingClientRect();
          const elementPosition = elementRect.top + window.scrollY - totalStickyHeight;
          
          console.log('Search scroll triggered:', { elementPosition, headerHeight, navHeight, totalStickyHeight });
          
          // Scroll to element with offset for sticky headers
          window.scrollTo({
            top: Math.max(0, elementPosition),
            behavior: 'smooth'
          });
        }
      }, 400);
    }
  }, [searchTerm]);

  // Show basic UI even if there's an error
  console.log('App rendering, loading:', loading, 'error:', error, 'articles:', articles.length);
  
  return (
    <ThemeProvider>
      <div className="App" style={{ minHeight: '100vh', visibility: 'visible', opacity: 1 }}>
        <div className="site-heading">
          <h1>Dev Pulse</h1>
        </div>
        <Header
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
          isMenuOpen={isMenuOpen}
        />

        <HomeHero onExploreClick={handleExploreClick} />
        <FeaturesSection />

        <main className="main-content" ref={contentRef}>
          {loading ? (
            <motion.div 
              className="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="spinner"></div>
              <p>Loading articles...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              className="error-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p>{error}</p>
              <button onClick={loadArticles} className="retry-button">
                Try Again
              </button>
            </motion.div>
          ) : filteredArticles.length === 0 ? (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p>No articles found. Try adjusting your filters.</p>
              <button onClick={loadArticles} className="retry-button">
                Refresh Articles
              </button>
            </motion.div>
          ) : (
            <>
              {heroArticles.length > 0 && !searchTerm && (
                <Hero articles={heroArticles} onCardClick={handleCardClick} />
              )}
              <section className="category-feed" ref={searchResultsRef}>
                <motion.h2 
                  className="section-title"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {searchTerm ? 'Search Results' : (selectedCategory === 'All' ? 'All News' : `${selectedCategory} News`)}
                </motion.h2>
                <NewsGrid articles={gridArticles} onCardClick={handleCardClick} />
              </section>
            </>
          )}
        </main>

        <Footer />
        <ArticleModal 
          article={selectedArticle} 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
