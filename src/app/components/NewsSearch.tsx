'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, NewspaperIcon, ClockIcon } from '@heroicons/react/24/outline';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  image: string;
  keywords: string[];
  sentiment: string;
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return 'Date not available';
  }
};

export default function NewsSearch() {
  const [query, setQuery] = useState('');
  const [size, setSize] = useState('10');
  const [language, setLanguage] = useState('en');
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/news/search?query=${encodeURIComponent(query)}&size=${size}&language=${language}`
      );
      
      if (!response.ok) {
        throw new Error(response.status === 400 ? 'Search query is required' : 'Failed to fetch results');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Search Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 bg-gray-600 px-8 py-4 rounded-2xl shadow-sm">
            <NewspaperIcon className="w-9 h-9 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-100">Crypto News Explorer</h1>
          </div>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="relative w-full md:w-[500px]">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cryptocurrency news..."
                className="w-full pl-14 pr-6 py-4 rounded-xl border-0 ring-1 ring-gray-600 focus:ring-2 focus:ring-blue-500 bg-gray-700 shadow-sm text-lg"
              />
              <MagnifyingGlassIcon className="w-6 h-6 absolute left-5 top-4 text-gray-400" />
            </div>

            <div className="flex gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-xl bg-gray-700 px-4 py-3 ring-1 ring-gray-600 focus:ring-2 focus:ring-blue-500 text-gray-100"
              >
                <option value="en">🌐 English</option>
                <option value="es">🇪🇸 Spanish</option>
                <option value="de">🇩🇪 German</option>
                <option value="fr">🇫🇷 French</option>
              </select>

              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="rounded-xl bg-gray-700 px-4 py-3 ring-1 ring-gray-600 focus:ring-2 focus:ring-blue-500 text-gray-100"
              >
                <option value="5">5 Results</option>
                <option value="10">10 Results</option>
                <option value="20">20 Results</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-3 text-lg font-medium shadow-lg hover:shadow-blue-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin">↻</div>
                  Searching...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Explore News
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(parseInt(size)).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                <Skeleton height={220} />
                <div className="p-6 space-y-4">
                  <Skeleton width={140} height={20} />
                  <Skeleton count={2} />
                  <Skeleton width={100} height={16} />
                </div>
              </div>
            ))
          ) : results.length > 0 ? (
            results.map((article, index) => (
              <article 
                key={index}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="relative h-56">
                  <img
                    src={article.image || '/news-placeholder.jpg'}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl font-semibold text-white line-clamp-2 leading-tight">
                      {article.title}
                    </h3>
                  </div>
                  <span className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      article.sentiment === 'positive' ? 'bg-green-500' :
                      article.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                    }`}></span>
                    {article.source}
                  </span>
                </div>
                
                <div className="p-5 space-y-5">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>

                  <p className="text-gray-600 line-clamp-3 leading-relaxed">
                    {article.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {article.keywords.slice(0, 4).map((keyword, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Read Full Story
                    <svg
                      className="w-4 h-4"
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
                  </a>
                </div>
              </article>
            ))
          ) : (
            !loading && (
              <div className="col-span-full text-center py-16">
                <div className="text-gray-400 text-lg">
                  No results found. Try searching for terms like "Bitcoin", "Ethereum", or "Blockchain"
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}