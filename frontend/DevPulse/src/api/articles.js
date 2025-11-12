// // Centralized API utility with environment variable support
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// export async function fetchArticles(limit = 20) {
//   try {
//     const response = await fetch(`${BASE_URL}/articles?limit=${limit}`);
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const data = await response.json();
//     return data;
//   } catch (err) {
//     console.error('Error fetching articles:', err);
//     throw err; // Re-throw for error handling in components
//   }
// }

// export async function fetchArticlesByCategory(category, limit = 20) {
//   try {
//     const response = await fetch(`${BASE_URL}/articles?limit=${limit}`);
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const data = await response.json();
//     // Filter by category on client side (backend could support this too)
//     return data.filter(article => {
//       let categories = [];
//       try {
//         if (typeof article.categories === 'string') {
//           categories = JSON.parse(article.categories);
//         } else if (Array.isArray(article.categories)) {
//           categories = article.categories;
//         }
//       } catch (e) {
//         console.warn('Failed to parse categories:', e);
//         categories = [];
//       }
//       return categories.includes(category);
//     });
//   } catch (err) {
//     console.error('Error fetching articles by category:', err);
//     throw err;
//   }
// }


// frontend/DevPulse/src/api/articles.js
const BASE_URL =
  import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

/**
 * Fetch paginated articles from backend
 * @param {number} page - Page number
 * @param {number} limit - Number of articles per page
 * @returns {Promise<Array>} - List of articles
 */
export async function fetchArticles(page = 1, limit = 20) {
  const url = `${BASE_URL}/articles?page=${page}&limit=${limit}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (res.status === 404) {
      // Backend returns 404 for "no data"
      console.warn("No articles found on page", page);
      return [];
    }

    if (!res.ok) {
      // Capture error message (without consuming stream twice)
      const errorText = await res.text();
      throw new Error(
        `HTTP ${res.status} ${res.statusText}: ${errorText.slice(0, 200)}`
      );
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.warn("Expected array, got:", data);
      return [];
    }

    return data;
  } catch (err) {
    console.error("fetchArticles error:", err.message || err);
    return [];
  }
}
