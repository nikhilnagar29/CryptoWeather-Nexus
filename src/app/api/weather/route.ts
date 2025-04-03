import { NextResponse } from 'next/server';

// Predefined cities as per your requirement
const CITIES = ['New York', 'London', 'Tokyo'];

interface WeatherData {
  id: string;
  name: string;
  temp: number;
  humidity: number;
  condition: string;
  icon: string;
  windSpeed: number;
  sunrise: number;
  sunset: number;
  lon: number;
  lat: number;
  minTemp: number;
  maxTemp: number;
  pressure: number;
}

export async function GET() {
  try {
    // Fetch weather data for all predefined cities in parallel
    const citiesData = await Promise.all(
      CITIES.map(async (city): Promise<WeatherData> => {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        
        if (!res.ok) throw new Error(`Failed to fetch ${city}`);
        
        const data = await res.json();
        // console.log(data);
        return {
          id: city.toLowerCase().replace(' ', '-'),
          name: city,
          temp: data.main.temp,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          condition: data.weather[0].main,
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset,
          icon: data.weather[0].icon,
          windSpeed: data.wind.speed,
          lon: data.coord.lon,
          lat: data.coord.lat,
          minTemp: data.main.temp_min,
          maxTemp: data.main.temp_max
        };
      })
    );
    
    return NextResponse.json(citiesData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
} 