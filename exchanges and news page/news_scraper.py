import feedparser
import pandas as pd
import sqlite3
import time
from datetime import datetime

def scrape_news():
    try:
        df = pd.read_csv('stock_exchanges.csv')
    except FileNotFoundError:
        print("Error: stock_exchanges.csv not found")
        return
    
    try:
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return
    
    for index, row in df.iterrows():
        exchange = row['Stock Exchange']
        host_country = row['Host Country']
        try:
            associated_countries = row['Associated Countries'].split(', ')
        except AttributeError:
            print(f"Error: Invalid Associated Countries format for {exchange}")
            continue
        news_outlets = row['News Outlets (with RSS Feeds)']
        
        if pd.isna(news_outlets) or not news_outlets.strip():
            print(f"Error: Empty or invalid news outlets for {exchange}")
            continue
        
        try:
            outlets = [outlet.strip() for outlet in news_outlets.split(', ')]
        except AttributeError:
            print(f"Error: Invalid news outlets format for {exchange} (news_outlets: '{news_outlets}')")
            continue

        for outlet in outlets:
            try:
                source, feed_url = outlet.split(': ', 1)
                feed = feedparser.parse(feed_url)
                
                if feed.bozo:
                    print(f"Error: Invalid RSS feed for {source} ({exchange}): {feed.bozo_exception}")
                    continue
                
                for entry in feed.entries:
                    title = entry.get('title', '')
                    link = entry.get('link', '')
                    published = entry.get('published', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                    
                    c.execute('''INSERT OR IGNORE INTO news (exchange, country, title, link, published, source)
                                 VALUES (?, ?, ?, ?, ?, ?)''',
                              (exchange, host_country, title, link, published, source))
                    
                    for country in associated_countries:
                        c.execute('''INSERT OR IGNORE INTO news (exchange, country, title, link, published, source)
                                     VALUES (?, ?, ?, ?, ?, ?)''',
                                  (exchange, country, title, link, published, source))
            except ValueError:
                print(f"Error: Invalid outlet format for {outlet} ({exchange})")
            except sqlite3.Error as e:
                print(f"Error inserting news for {outlet} ({exchange}): {e}")
            except Exception as e:
                print(f"Error scraping {outlet} ({exchange}): {e}")
        
        conn.commit()
    
    conn.close()

if __name__ == '__main__':
    while True:
        print("Scraping news...")
        scrape_news()
        print("Waiting for next scrape...")
        time.sleep(600)