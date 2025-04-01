import { NextResponse } from 'next/server';

export async function GET(_: Request, context: { params: Promise<{ cityId: string }> }) {
  const { cityId } = await context.params;

  try {
    // Get city coordinates
    const geoResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityId}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );

    if (!geoResponse.ok) throw new Error(`City "${cityId}" not found`);
    const geoData = await geoResponse.json();
    const { lat, lon } = geoData.coord;

    // Fetch 5-day forecast (used as pseudo-historical data)
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );

    if (!forecastResponse.ok) throw new Error(`Failed to fetch forecast data`);
    const forecastData = await forecastResponse.json();

    return NextResponse.json({
      id: cityId,
      name: geoData.name,
      current: {
        temp: geoData.main.temp,
        humidity: geoData.main.humidity,
        condition: geoData.weather[0].main,
        icon: geoData.weather[0].icon, // Add this
        windSpeed: geoData.wind.speed // Add this
      },
      forecast: forecastData.list.map((entry: any) => ({
        date: entry.dt * 1000, // Convert to milliseconds for JS Date
        temp: entry.main.temp,
        humidity: entry.main.humidity,
        condition: entry.weather[0].main,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error fetching data' }, { status: 500 });
  }
}
