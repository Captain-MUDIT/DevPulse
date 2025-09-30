// frontend/DevPulse/src/components/NewsGrid.jsx
import React from "react";
import NewsCard from "./NewsCard";
import "../styles/NewsGrid.css";

function NewsGrid({ articles }) {
  return (
    <div className="news-grid">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export default NewsGrid;
