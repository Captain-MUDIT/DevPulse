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

// frontend/DevPulse/src/components/Articles.jsx
import React, { useEffect, useState } from "react";
import NewsCard from "./NewsCard";
import { fetchArticles } from "../api/articles"; // ✅ centralized API call

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        const data = await fetchArticles(30); // Fetch latest 30 articles
        // Sort by published date (newest first)
        const sorted = data.sort(
          (a, b) => new Date(b.published) - new Date(a.published)
        );
        setArticles(sorted);
      } catch (err) {
        console.error("Error loading articles:", err);
        setError("Failed to load articles.");
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading articles...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!articles.length) return <p className="text-center text-gray-400">No articles found.</p>;

  return (
    <div className="articles-grid">
      {articles.map((article) => (
        <NewsCard key={article.id} {...article} />
      ))}
    </div>
  );
};

export default Articles;
