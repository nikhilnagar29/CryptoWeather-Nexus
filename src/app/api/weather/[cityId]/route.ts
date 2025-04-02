import { NextResponse } from 'next/server';

interface WeatherData {
  id: string;
  name: string;
  temp: number;
  humidity: number;
  condition: string;
  icon: string;
  windSpeed: number;
  windDirection: number;
  sunrise: number;
  sunset: number;
  lon: number;
  lat: number;
  minTemp: number;
  maxTemp: number;
  pressure: number;
}

export async function GET(
    _: Request,
    context: { params: Promise<{ cityId: string }> } // Remove Promise<>
  ) {
    try {
      const { cityId } = await context.params; // No need to await
      console.log("cityId", cityId);
  
      // Fetch weather data for the requested city
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityId)}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
      );
     
  
      if (!res.ok) throw new Error(`Failed to fetch weather data for ${cityId}`);
  
      const data = await res.json();
  
      const cityWeather: WeatherData = {
        id: cityId.toLowerCase().replace(' ', '-'), // This isn't needed, cityId is already formatted correctly
        name: cityId,
        temp: data.main.temp,
        humidity: data.main.humidity,
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        lon: data.coord.lon,
        lat: data.coord.lat,
        minTemp: data.main.temp_min,
        maxTemp: data.main.temp_max,
        pressure: data.main.pressure
      };

      if(cityWeather.maxTemp - cityWeather.minTemp < 4) {
        cityWeather.maxTemp = cityWeather.maxTemp + 4;
        cityWeather.minTemp = cityWeather.minTemp - 1.5;
      }
  
      return NextResponse.json(cityWeather);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: 'Failed to fetch weather data' },
        { status: 500 }
      );
    }
  }
  