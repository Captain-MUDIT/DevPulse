// src/api/articles.js

const BASE_URL = "http://127.0.0.1:8000";

export async function fetchArticles(limit = 20) {
  try {
    const response = await fetch(`${BASE_URL}/articles?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching articles:", err);
    return [];
  }
}
