// components/CryptoNewsFeed.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  image?: string;
}

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
    <div className="lg:px-8 py-12">
  <div className="flex items-center justify-between mb-8">
    <div className="relative">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white relative inline-block">
        <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Latest Crypto News
        </span>
        <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
      </h2>
    </div>
    <span className="flex items-center gap-2 px-3 py-1 bg-blue-900 rounded-full text-sm font-medium text-blue-600 dark:text-blue-200">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
      </span>
      Live Updates
    </span>
  </div>

  <div className="space-y-6">
    {loading ? (
      Array(3).fill(0).map((_, i) => (
        <Card key={i} className="p-4 bg-transparent">
          <div className="flex gap-4 animate-pulse">
            <Skeleton className="h-32 w-48 rounded-xl" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-4 w-[200px] rounded-lg" />
              <Skeleton className="h-4 w-[180px] rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full rounded-lg" />
                <Skeleton className="h-3 w-[90%] rounded-lg" />
                <Skeleton className="h-3 w-[80%] rounded-lg" />
              </div>
            </div>
          </div>
        </Card>
      ))
    ) : (
      news.map((article) => (
        <Card
          key={article.url}
          className="group relative border-1 border-gray-700 bg-gray-800 overflow-hidden transition-all duration-300 translate-y-1 hover:shadow-xl shadow-blue-900/20"
        >
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row gap-4 p-6"
          >
            {article.image && (
              <div className="relative flex-shrink-0 w-full sm:w-48 h-48 sm:h-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 mix-blend-multiply" />
                <img
                  src={article.image}
                  alt={article.title}
                  className="rounded-xl object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium shadow-sm border">
                  {article.source}
                </span>
              </div>
            )}

            <div className={`flex-1 ${!article.image ? 'sm:pl-4' : ''}`}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <time 
                  dateTime={article.publishedAt}
                  className="flex items-center gap-1.5 text-gray-300"
                >
                  <span className="text-blue-500">🕒</span>
                  {formatRelativeTime(article.publishedAt)}
                </time>
                <span className="text-muted-foreground/50">|</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {article.source}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-3 line-clamp-2 bg-gradient-to-r from-gray-100 to-gray-500 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                {article.title}
              </h3>

              <p className="line-clamp-3 mb-4 text-gray-100 leading-relaxed">
                {article.description}
              </p>

              <div className="inline-flex items-center text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">
                  Read Full Analysis
                </span>
                <svg
                  className="w-4 h-4 ml-2 mt-px transform transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          </a>
        </Card>
      ))
    )}
  </div>
</div>
  );
}