# import sqlite3
# from tabulate import tabulate

# def print_articles(limit: int = 10):
#     """
#     Prints stored articles neatly in a tablura format.

#     Args:
#         limit (int): No. of rows to fetch from db.
#     """
    
#     conn = sqlite3.connect("src/db/articles.db")
#     cursor = conn.cursor()
    
#     cursor.execute("PRAGMA table_info(articles);")
#     columns = [col[1] for col in cursor.fetchall()]
    
#     # Fetch articles
#     cursor.execute(f"SELECT * FROM articles ORDER BY published DESC LIMIT {limit};")
#     rows = cursor.fetchall()
    
#     conn.close()
    
#     if rows:
#         print(tabulate(rows, headers=columns, tablefmt="fancy_grid", maxcolwidths=[None, 40, 50, 40]))
#     else:
#         print("No articles found in database.")
        
# if __name__ == "__main__":
#     print_articles(limit=10)
    
    
import sqlite3

DB_PATH = "src/db/articles.db"

def print_summaries(limit=10):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(f"""
        SELECT title, summary, published 
        FROM articles 
        ORDER BY published ASC
        LIMIT {limit};
    """)
    
    articles = cursor.fetchall()
    
    for i, (title, summary, published) in enumerate(articles, 1):
        print(f"{i}. {title} ({published})\n")
        print(f"Summary: {summary}\n")
        print("-" * 80)
    
    conn.close()

if __name__ == "__main__":
    print_summaries()
