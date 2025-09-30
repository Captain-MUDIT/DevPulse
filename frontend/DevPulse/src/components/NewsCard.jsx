// frontend/DevPulse/src/components/NewsCard.jsx
import React from "react";
import "../styles/NewsCard.css";

function NewsCard({ article }) {
  return (
    <div className="news-card">
      <h3 className="news-title">{article.title}</h3>
      <p className="news-source">{article.source} | {new Date(article.published).toLocaleString()}</p>
      <p className="news-summary">{article.summary}</p>
      <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link">
        Read More
      </a>
    </div>
  );
}

export default NewsCard;
