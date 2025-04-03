// app/crypto/[cryptoId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, ArrowDown, LinkIcon, Coins, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import CryptoChart from '@/components/CryptoChart';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  description: string;
  hashing_algorithm: string | null;
  image: string;
  market_data: {
    current_price: Record<string, number> | null;
    market_cap: Record<string, number> | null;
    total_volume: Record<string, number> | null;
    price_change_percentage_24h: number | null;
    price_change_percentage_7d: number | null;
    price_change_percentage_30d: number | null;
    price_change_percentage_1y: number | null;
  };
  homepage: string;
  genesis_date: string | null;
  sentiment_votes_up_percentage: number | null;
  sentiment_votes_down_percentage: number | null;
  blockchain_site: string;
  total_supply: number | null;
  last_updated: string;
}

export default function CryptoDashboard() {
  const params = useParams<{ cryptoId: string }>();
  const [data, setData] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/crypto/${params.cryptoId}`);
     
        if (!res.ok) throw new Error('Failed to fetch data');
        const jsonData = await res.json();
       
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.cryptoId]);

  if (error) return <div className="text-red-400 text-center p-8">{error}</div>;

  return (
    <div className="min-h-screen  bg-gray-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div >
          
          <div>
            <CryptoChart cryptoId={params.cryptoId} />
          </div>
        </div>

        {/* Price & Market Data */}
        {!loading && data?.market_data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-100">Current Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-300">
                  ${data.market_data.current_price?.toLocaleString() || 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-100">24h Change</CardTitle>
              </CardHeader>
              <CardContent>
                <PriceChange  percentage={data.market_data.price_change_percentage_24h} />
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-100">Market Cap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl text-gray-300">
                  ${data.market_data.market_cap?.toLocaleString() || 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-100    ">Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl text-gray-300">
                  ${data.market_data.total_volume?.toLocaleString() || 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Description */}
        {data?.description && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-100">About {data.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">{data.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Details */}
        <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
            <CardTitle className="text-2xl text-gray-100 mb-2">Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
            <Table>
                <TableBody>
                {data?.hashing_algorithm && (
                    <TableRow className="hover:bg-gray-750 transition-colors">
                    <TableCell className="font-semibold text-gray-100">
                        <div className="flex items-center gap-3">
                        {/* <Algorithm className="w-5 h-5 text-blue-400" /> */}
                        Algorithm
                        </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{data.hashing_algorithm}</TableCell>
                    </TableRow>
                )}
                {data?.genesis_date && (
                    <TableRow className="hover:bg-gray-750 transition-colors">
                    <TableCell className="font-semibold text-gray-100">
                        <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        Genesis Date
                        </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{data.genesis_date}</TableCell>
                    </TableRow>
                )}
                {data?.total_supply && (
                    <TableRow className="hover:bg-gray-750 transition-colors">
                    <TableCell className="font-semibold text-gray-100">
                        <div className="flex items-center gap-3">
                        <Coins className="w-5 h-5 text-green-400" />
                        Total Supply
                        </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                        {data.total_supply.toLocaleString()}
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>

        {/* Sentiment Analysis */}
        {(data?.sentiment_votes_up_percentage || data?.sentiment_votes_down_percentage) && (
            <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle className="text-2xl text-gray-100 mb-2">Community Sentiment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {data.sentiment_votes_up_percentage && (
                <div>
                    <div className="flex justify-between mb-2">
                    <span className="text-green-400 font-medium">Positive</span>
                    <span className="text-gray-100">
                        {data.sentiment_votes_up_percentage.toFixed(1)}%
                    </span>
                    </div>
                    <Progress
                    value={data.sentiment_votes_up_percentage}
                    className="h-2.5 bg-gray-700"

                    />
                </div>
                )}
                {data.sentiment_votes_down_percentage && (
                <div>
                    <div className="flex justify-between mb-2">
                    <span className="text-red-400 font-medium">Negative</span>
                    <span className="text-gray-100">
                        {data.sentiment_votes_down_percentage.toFixed(1)}%
                    </span>
                    </div>
                    <Progress
                    value={data.sentiment_votes_down_percentage}
                    className="h-2.5 bg-gray-700"

                    />
                </div>
                )}
            </CardContent>
            </Card>
        )}
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.homepage && (
            <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle className="text-2xl text-gray-100">Official Website</CardTitle>
            </CardHeader>
            <CardContent>
                <a
                href={data.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-3 group"
                >
                <LinkIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="border-b border-transparent hover:border-blue-300 transition-all">
                    {new URL(data.homepage).hostname}
                </span>
                </a>
            </CardContent>
            </Card>
        )}

        {data?.blockchain_site && (
            <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle className="text-2xl text-gray-100">Blockchain Explorer</CardTitle>
            </CardHeader>
            <CardContent>
                <a
                href={data.blockchain_site}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-3 group"
                >
                <LinkIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="border-b border-transparent hover:border-blue-300 transition-all">
                    {new URL(data.blockchain_site).hostname}
                </span>
                </a>
            </CardContent>
            </Card>
        )}
        </div>
      </div>
    </div>
  );
}

const PriceChange = ({ percentage }: { percentage: number | null }) => {
  if (percentage === null) return <div className="text-gray-400">N/A</div>;
  
  const isPositive = percentage >= 0;
  const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
  
  return (
    <div className={`flex items-center gap-2 ${colorClass}`}>
      {isPositive ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
      <span className="text-xl">{Math.abs(percentage).toFixed(2)}%</span>
    </div>
  );
};