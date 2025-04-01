'use client';

import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  image: string;
}

const formatRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const formatter = new Intl.RelativeTimeFormat('en', { style: 'short' });
    
    if (diffInSeconds < 60) {
      return formatter.format(-Math.floor(diffInSeconds), 'second');
    }
    if (diffInSeconds < 3600) {
      return formatter.format(-Math.floor(diffInSeconds / 60), 'minute');
    }
    if (diffInSeconds < 86400) {
      return formatter.format(-Math.floor(diffInSeconds / 3600), 'hour');
    }
    return formatter.format(-Math.floor(diffInSeconds / 86400), 'day');
  } catch (error) {
    return 'Recently';
  }
};

export default function CryptoNewsFeed() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) throw new Error('Failed to fetch news');
        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 dark:text-white">
        Latest Crypto News
        <span className="ml-2 text-blue-500">•</span>
        <span className="ml-2 text-blue-500 animate-pulse">Live</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <Skeleton height={200} />
              <div className="p-4">
                <Skeleton count={3} />
              </div>
            </div>
          ))
        ) : (
          news.map((article, index) => (
            <article 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={article.image || '/crypto-placeholder.jpg'}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {article.source}
                </span>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <time dateTime={article.publishedAt}>
                    {formatRelativeTime(article.publishedAt)}
                  </time>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                  {article.description}
                </p>
                
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors duration-200"
                >
                  Read More
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}