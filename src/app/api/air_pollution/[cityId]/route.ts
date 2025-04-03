import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await params; // Await and destructure cityId

    if (!cityId) throw new Error("City ID is required");

    // Fetch city coordinates
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityId}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    if (!geoResponse.ok) throw new Error(`City "${cityId}" not found`);

    const geoData = await geoResponse.json();
    if (!geoData.length) throw new Error('City not found');

    const { lat, lon } = geoData[0];

    // Fetch air pollution data
    const airPollutionResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    if (!airPollutionResponse.ok) throw new Error('Failed to fetch air pollution data');

    const airPollutionData = await airPollutionResponse.json();

    const pollutionDetails = airPollutionData.list[0];
    const result = {
      city: cityId,
      aqi: pollutionDetails.main.aqi,
      components: pollutionDetails.components,
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error fetching data' }, { status: 500 });
  }
}
