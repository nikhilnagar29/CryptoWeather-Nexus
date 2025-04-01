// app/api/news/route.ts
import { NextResponse } from 'next/server';

// Cache implementation to reduce API calls
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Assuming you have the Article interface defined
interface Article {
  title: string;
  description: string;
  source_id: string;
  link: string;
  pubDate: string;
  image_url: string;
  keywords?: string[];
}

export async function GET() {
  try {
    // Check cache first
    const cacheKey = 'top_crypto_news';
    const cachedData = cache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
      return NextResponse.json(cachedData.data);
    }

    // Fetch top crypto news headlines
    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=cryptocurrency OR bitcoin OR ethereum OR crypto&language=en&size=5`
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const newsData = await response.json();
    
    // Transform the data to include only what you need
    const processedData = newsData.results.map((article: Article) => ({
      title: article.title,
      description: article.description,
      source: article.source_id,
      url: article.link,
      publishedAt: article.pubDate,
      image: article.image_url
    }));

    // Store in cache
    cache.set(cacheKey, {
      data: processedData,
      timestamp: Date.now()
    });

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('News API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch news data' },
      { status: 500 }
    );
  }
}
