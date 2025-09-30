import React, { useEffect, useState } from "react";
import NewsCard from "./NewsCard";

const Articles = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/articles")  // FastAPI endpoint
      .then((res) => res.json())
      .then((data) => {
        // Sort by newest first
        const sorted = data.sort(
          (a, b) => new Date(b.published) - new Date(a.published)
        );
        setArticles(sorted);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="articles-grid">
      {articles.map((article) => (
        <NewsCard key={article.id} {...article} />
      ))}
    </div>
  );
};

export default Articles;
