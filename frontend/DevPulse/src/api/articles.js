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
const BASE_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "") || "http://127.0.0.1:8000";

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchArticles(page = 1, limit = 20) {
  const url = `${BASE_URL}/articles?page=${page}&limit=${limit}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    // If server returns 404 for "no articles", treat as empty array
    if (res.status === 404) return [];
    if (!res.ok) {
      const txt = await safeJson(res) || `${res.status} ${res.statusText}`;
      throw new Error(`HTTP error ${res.status}: ${JSON.stringify(txt)}`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      console.warn("fetchArticles: expected array, got:", data);
      return [];
    }
    return data;
  } catch (err) {
    console.error(`fetchArticles error (${url}):`, err);
    throw err;
  }
}
