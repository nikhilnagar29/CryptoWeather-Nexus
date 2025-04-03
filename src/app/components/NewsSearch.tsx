'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { MagnifyingGlassIcon, ClockIcon, ReloadIcon } from '@radix-ui/react-icons';

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

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

  if (diffHours < 1) return `${Math.floor(diffHours * 60)}m ago`;
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

export default function NewsSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [size, setSize] = useState('10');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/news/search?query=${encodeURIComponent(query)}&size=${3}&language=${language}`
      );

      console.log(response);
      
      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      
      // Generate additional insights
      
      
      setResults(data.map((article: NewsArticle, index: number) => ({
        ...article,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative">
          <h2 className="text-3xl font-bold text-foreground relative inline-block">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Crypto News Explorer
            </span>
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
          </h2>
        </div>
        
        <Badge variant="outline" className="gap-2 px-3 py-1 border-2 border-gray-800 text-gray-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
          </span>
          Real-time Updates
        </Badge>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cryptocurrency news..."
            className="pl-12 pr-6 py-6 text-lg border-2 border-gray-800 text-gray-300 bg-gray-800 text-2xl"
          />
          <MagnifyingGlassIcon className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[150px] py-6 border-2 border-gray-800 text-gray-300 bg-gray-800">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="text-gray-300" value="en">🌐 English</SelectItem>
              <SelectItem className="text-gray-300" value="es">🇪🇸 Spanish</SelectItem>
              <SelectItem className="text-gray-300" value="de">🇩🇪 German</SelectItem>
              <SelectItem className="text-gray-300" value="fr">🇫🇷 French</SelectItem>
            </SelectContent>
          </Select>

          
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="py-6 text-lg gap-2 border-2 border-gray-800  text-gray-300 bg-gray-800"
          disabled={loading}
        >
          {loading ? (
            <>
              <ReloadIcon className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <MagnifyingGlassIcon className="w-5 h-5" />
              Explore News
            </>
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(parseInt(size)).fill(0).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex flex-col gap-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </Card>
          ))
        ) : results.length > 0 ? (
          results.map((article) => (
            <Card
              key={article.url}
              className="group relative overflow-hidden transition-transform hover:-translate-y-1 bg-gray-800"
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col h-full"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                  <Badge className="absolute top-4 right-4 backdrop-blur-sm">
                    {article.source}
                  </Badge>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-gray-300">{formatRelativeTime(article.publishedAt)}</span>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 text-gray-300">
                    {article.title}
                  </h3>

                  <p className="text-gray-300 line-clamp-3 mb-4">
                    {article.description}
                  </p>

                  {/* Additional Insights */}
                  <div className="mt-auto space-y-2 text-gray-600">
                    <div className="flex gap-2">
                      <Badge variant={article.sentiment === 'positive' ? 'default' : 'destructive'}>
                        {article.sentiment} Sentiment
                      </Badge>
                      
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-gray-600">
                      {article.keywords.slice(0, 3).map((keyword) => (
                        <Badge 
                          key={keyword}
                          variant="secondary"
                          className="font-normal text-blue-700"
                        >
                          #{keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </a>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center  space-y-4">
            <div className="text-muted-foreground text-lg">
             
            </div>
          </div>
        )}
      </div>
    </div>
  );
}