// app/api/crypto/[cryptoId]/route.ts
import { NextResponse } from 'next/server';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cryptoId: string }> }
) {
  const { cryptoId } = await params;


  try {
    // Check cache first
    const cacheKey = `crypto_${cryptoId}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedData.data);
    }

    // Fetch detailed data from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${cryptoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
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

    data.market_data = data.market_data || {}; // Ensure market_data exists

    data.market_data = {
      current_price: data.market_data.current_price?.usd ?? null,
      market_cap: data.market_data.market_cap?.usd ?? null,
      total_volume: data.market_data.total_volume?.usd ?? null,
      high_24h: data.market_data.high_24h?.usd ?? null,
      low_24h: data.market_data.low_24h?.usd ?? null,
      price_change_24h: data.market_data.price_change_percentage_24h ?? null,
      price_change_7d: data.market_data.price_change_percentage_7d ?? null,
      price_change_30d: data.market_data.price_change_percentage_30d ?? null,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h ?? null,
      price_change_percentage_7d: data.market_data.price_change_percentage_7d ?? null,
      price_change_percentage_30d: data.market_data.price_change_percentage_30d ?? null,
      price_change_percentage_1y: data.market_data.price_change_percentage_1y ?? null,
    };
    
    console.log(data);
    // Extract relevant data
    const processedData = {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        description: data.description.en,
        hashing_algorithm: data.hashing_algorithm,
        image: data.image.large,
        market_data: {
          current_price: data.market_data?.current_price ?? null,
          market_cap: data.market_data?.market_cap ?? null,
          total_volume: data.market_data?.total_volume ?? null,
          high_24h: data.market_data?.high_24h ?? null,
          low_24h: data.market_data?.low_24h ?? null,
          price_change_24h: data.market_data?.price_change_percentage_24h ?? null,
          price_change_7d: data.market_data?.price_change_percentage_7d ?? null,
          price_change_30d: data.market_data?.price_change_percentage_30d ?? null,
          price_change_percentage_24h: data.market_data?.price_change_percentage_24h ?? null,
          price_change_percentage_7d: data.market_data?.price_change_percentage_7d ?? null,
          price_change_percentage_30d: data.market_data?.price_change_percentage_30d ?? null,
          price_change_percentage_1y: data.market_data?.price_change_percentage_1y ?? null,
        },
        homepage: data.links.homepage[0],
        genesis_date: data.genesis_date,
        sentiment_votes_up_percentage: data.sentiment_votes_up_percentage,
        sentiment_votes_down_percentage: data.sentiment_votes_down_percentage,
        blockchain_site: data.links.blockchain_site[0],
        total_supply: data.market_data.total_supply,
        last_updated: data.last_updated,
      };
      

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
