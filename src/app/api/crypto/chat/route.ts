import { NextRequest, NextResponse } from 'next/server';

const cache = new Map(); // In-memory cache
const CACHE_EXPIRATION_TIME = 30 * 60 * 1000; // 15 minutes

// Function to fetch data from CoinGecko API
const fetchCryptoData = async (cryptoId: string, days: number) => {
  console.log(`Fetching new data for ${cryptoId} (${days} days)`);

  const url = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}`;

  try {
    const response = await fetch(url);
    // console.log(response);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(`Fetch failed: ${error.message}`);
  }
};

// ✅ API Route with Caching
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cryptoId = searchParams.get("cryptoId") || "bitcoin";
    const days = Number(searchParams.get("days")) || 7;

    const cacheKey = `${cryptoId}_${days}`;
    const cachedData = cache.get(cacheKey);

    // ✅ Return cached data if it's still valid
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION_TIME) {
      console.log(`Serving from cache: ${cryptoId} (${days} days)`);
      return NextResponse.json(cachedData.data, { status: 200 });
    }

    // 🆕 Fetch new data and update cache
    const data = await fetchCryptoData(cryptoId, days);
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
