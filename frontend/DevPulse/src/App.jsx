import React, { useEffect, useState } from "react";
import NewsGrid from "./components/NewsGrid";
import "./styles/App.css";

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/articles?limit=20")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching articles:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <h1>DevPulse</h1>
      {loading ? (
        <p>Loading articles...</p>
      ) : articles.length > 0 ? (
        <NewsGrid articles={articles} />
      ) : (
        <p>No articles found.</p>
      )}
    </div>
  );
}

export default App;
