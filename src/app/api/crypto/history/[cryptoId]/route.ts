// app/api/crypto/history/[cryptoId]/route.ts
import { NextResponse } from 'next/server';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 300000; // 5 minute cache for historical data

export async function GET(
  request: Request,
  { params }: { params: { cryptoId: string } }
) {
  const { cryptoId } = await params;
  const url = new URL(request.url);
  const days = url.searchParams.get('days') || '7';
  
  try {
    // Check cache first
    const cacheKey = `crypto_history_${cryptoId}_${days}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedData.data);
    }

    // Fetch historical data from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Cryptocurrency with ID "${cryptoId}" not found` },
          { status: 404 }
        );
      }
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process the data for charts
    const processedData = {
      id: cryptoId,
      days: parseInt(days),
      prices: data.prices.map((item: [Date, number]) => ({
        timestamp: item[0],
        price: item[1]
      })),
      market_caps: data.market_caps.map((item: [Date, number]) => ({
        timestamp: item[0],
        market_cap: item[1]
      })),
      total_volumes: data.total_volumes.map((item: [Date, number]) => ({
        timestamp: item[0],
        volume: item[1]
      }))
    };

    // Update cache
    cache.set(cacheKey, {
      data: processedData,
      timestamp: Date.now()
    });

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Crypto History API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}
