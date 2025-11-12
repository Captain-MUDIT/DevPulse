// import React, { useEffect, useState } from "react";
// import NewsCard from "./NewsCard";

// const Articles = () => {
//   const [articles, setArticles] = useState([]);

//   useEffect(() => {
//     fetch("http://localhost:8000/articles")  // FastAPI endpoint
//       .then((res) => res.json())
//       .then((data) => {
//         // Sort by newest first
//         const sorted = data.sort(
//           (a, b) => new Date(b.published) - new Date(a.published)
//         );
//         setArticles(sorted);
//       })
//       .catch((err) => console.error(err));
//   }, []);

//   return (
//     <div className="articles-grid">
//       {articles.map((article) => (
//         <NewsCard key={article.id} {...article} />
//       ))}
//     </div>
//   );
// };

// export default Articles;

// // frontend/DevPulse/src/components/Articles.jsx
// import React, { useEffect, useState } from "react";
// import NewsCard from "./NewsCard";
// import { fetchArticles } from "../api/articles"; // ✅ centralized API call

// const Articles = () => {
//   const [articles, setArticles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     async function loadArticles() {
//       try {
//         setLoading(true);
//         const data = await fetchArticles(30); // Fetch latest 30 articles
//         // Sort by published date (newest first)
//         const sorted = data.sort(
//           (a, b) => new Date(b.published) - new Date(a.published)
//         );
//         setArticles(sorted);
//       } catch (err) {
//         console.error("Error loading articles:", err);
//         setError("Failed to load articles.");
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadArticles();
//   }, []);

//   if (loading) return <p className="text-center text-gray-500">Loading articles...</p>;
//   if (error) return <p className="text-center text-red-500">{error}</p>;
//   if (!articles.length) return <p className="text-center text-gray-400">No articles found.</p>;

//   return (
//     <div className="articles-grid">
//       {articles.map((article) => (
//         <NewsCard key={article.id} {...article} />
//       ))}
//     </div>
//   );
// };

// export default Articles;



// frontend/DevPulse/src/components/Articles.jsx
import React, { useEffect, useState, useRef } from "react";
import NewsCard from "./NewsCard";
import { fetchArticles } from "../api/articles";

const PER_PAGE = 20; // change to 50 if you prefer

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // guard to avoid double calls on mount
  const mountedRef = useRef(false);

  // load first page on mount (fresh)
  useEffect(() => {
    async function initLoad() {
      setError(null);
      setLoading(true);
      setHasMore(true);
      setPage(1);
      try {
        const data = await fetchArticles(1, PER_PAGE);
        setArticles(Array.isArray(data) ? data : []);
        if (!data || data.length < PER_PAGE) setHasMore(false);
      } catch (err) {
        setError("Failed to load articles.");
        setArticles([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        mountedRef.current = true;
      }
    }
    initLoad();
  }, []); // run only on mount

  // load more pages when page state increases (not the initial mount)
  useEffect(() => {
    // skip initial mount call because initial load handled above
    if (!mountedRef.current) return;
    if (page === 1) return; // already loaded as initial page

    async function loadMore() {
      setLoadingMore(true);
      try {
        const data = await fetchArticles(page, PER_PAGE);
        if (!data || data.length === 0) {
          setHasMore(false);
          return;
        }
        setArticles(prev => [...prev, ...data]);
        if (data.length < PER_PAGE) setHasMore(false);
      } catch (err) {
        setError("Failed to load more articles.");
        setHasMore(false);
      } finally {
        setLoadingMore(false);
      }
    }
    loadMore();
  }, [page]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    setPage(p => p + 1);
  };

  if (loading) return <p className="text-center text-gray-500">Loading articles...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!articles.length) return <p className="text-center text-gray-400">No articles found.</p>;

  return (
    <div className="articles-container">
      <div className="articles-grid">
        {articles.map(article => (
          <NewsCard key={article.id} {...article} />
        ))}
      </div>

      {loadingMore && <p className="text-center text-gray-500 mt-4">Loading more...</p>}

      {!loadingMore && hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Load More
          </button>
        </div>
      )}

      {!hasMore && <p className="text-center text-gray-500 mt-4">No more articles.</p>}
    </div>
  );
};

export default Articles;
