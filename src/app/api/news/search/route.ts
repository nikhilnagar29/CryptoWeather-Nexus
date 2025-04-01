// app/api/news/search/route.ts
import { NextResponse } from 'next/server';

// Define an interface for the article structure
interface Article {
  title: string;
  description: string;
  source_id: string;
  link: string;
  pubDate: string;
  image_url: string;
  keywords?: string[]; // Add keywords as an optional property
}

export async function GET(request: Request) {
  try {
    // Get query parameters from request URL
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const size = url.searchParams.get('size') || '10';
    const language = url.searchParams.get('language') || 'en';
    
    // Ensure query is not empty
    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Fetch news based on search query
    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=${query}&language=${language}&size=${size}&category=business`
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const newsData = await response.json();
    
    // Transform the data
    const processedData = newsData.results.map((article: Article) => ({
      title: article.title,
      description: article.description,
      source: article.source_id,
      url: article.link,
      publishedAt: article.pubDate,
      image: article.image_url,
      // Include additional fields for search results
      keywords: article.keywords || [],
      sentiment: 'neutral' // Default sentiment if not provided by API
    }));

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('News Search API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search news data' },
      { status: 500 }
    );
  }
}
