// frontend/DevPulse/src/pages/home.jsx
import React from "react";
import NewsGrid from "../components/NewsGrid";

function Home({ articles }) {
  return (
    <div>
      <h2>Latest News</h2>
      <NewsGrid articles={articles} />
    </div>
  );
}

export default Home;
