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



import React, { useEffect, useState } from "react";
import NewsCard from "./NewsCard";
import { fetchArticles } from "../api/articles";

const PAGE_SIZE = 20;

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // ✅ Load first page ONLY once when site loads
  useEffect(() => {
    // Always start at page 1 on mount (no carryover)
    setPage(1);
    loadArticles(1, true);
  }, []); // run once on mount only

  // ✅ Unified loader function
  const loadArticles = async (currentPage, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchArticles(currentPage, PAGE_SIZE);

      if (reset) setArticles(data);
      else setArticles((prev) => [...prev, ...data]);

      // If we got fewer than PAGE_SIZE, no more data
      if (!data || data.length < PAGE_SIZE) setHasMore(false);
      else setHasMore(true);
    } catch (err) {
      console.error("Error loading articles:", err);
      setError("Failed to load articles.");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load next page when button clicked
  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadArticles(nextPage);
  };

  // ✅ Render states
  if (loading && articles.length === 0)
    return <p className="text-center text-gray-500">Loading articles...</p>;

  if (error)
    return <p className="text-center text-red-500">{error}</p>;

  if (!articles.length && !loading)
    return <p className="text-center text-gray-400">No articles found.</p>;

  return (
    <div className="flex flex-col items-center">
      <div className="articles-grid">
        {articles.map((article) => (
          <NewsCard key={article.id} {...article} />
        ))}
      </div>

      {/* Load More button */}
      {hasMore && !loading && (
        <button
          onClick={handleLoadMore}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Load More
        </button>
      )}

      {loading && articles.length > 0 && (
        <p className="text-center text-gray-500 mt-4">Loading more...</p>
      )}

      {!hasMore && !loading && (
        <p className="text-center text-gray-500 mt-4">
          You've reached the end 🎉
        </p>
      )}
    </div>
  );
};

export default Articles;
