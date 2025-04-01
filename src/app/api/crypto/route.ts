// app/api/crypto/route.ts
import { NextResponse } from 'next/server';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

// Define an interface for the coin structure
interface Coin {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    high_24h: number;
    low_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    market_cap: number;
    image: string;
    last_updated: string;
  }

export async function GET() {
  try {
    // Check cache first
    const cacheKey = 'all_cryptos';
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedData.data);
    }

    // Track Bitcoin, Ethereum, and one more (Dogecoin)
    const cryptos = ['bitcoin', 'ethereum', 'dogecoin'];
    
    // Fetch data from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptos.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
    );
    

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    // console.log(data);
    // Transform data to include only what's needed
    const processedData = data.map((coin : Coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      current_price: coin.current_price,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      price_change_percentage_7d: coin.price_change_percentage_7d,
      market_cap: coin.market_cap,
      image: coin.image,
      last_updated: coin.last_updated
    }));

    // Update cache
    cache.set(cacheKey, {
      data: processedData,
      timestamp: Date.now()
    });

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Crypto API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch cryptocurrency data' },
      { status: 500 }
    );
  }
}
