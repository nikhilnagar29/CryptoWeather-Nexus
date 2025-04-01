// app/weather/[cityId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Sun, Moon, Droplets, Wind, Thermometer, Gauge, Navigation, 
  Sunrise, Sunset, Compass, CloudSun
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherData {
  name: string;
  temp: number;
  humidity: number;
  condition: string;
  icon: string;
  windSpeed: number;
  windDirection: number;
  sunrise: number;
  sunset: number;
  minTemp: number;
  maxTemp: number;
  pressure: number;
  lat: number;
  lon: number;
}

export default function WeatherPage() {
  const router = useRouter();
  const params = useParams<{ cityId: string }>();
  const cityId = params?.cityId || '';

  const [search, setSearch] = useState(cityId);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (city: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/weather/${city}`);
      if (!res.ok) throw new Error('City not found');
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  function getCardinalDirection(degrees: number) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  useEffect(() => {
    fetchWeather(cityId);
  }, [cityId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/weather/${encodeURIComponent(search.toLowerCase())}`);
  };

  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search city..."
            className="bg-gray-800 border-gray-700 text-white"
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Search
          </Button>
        </form>

        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-48 w-full rounded-xl bg-gray-800" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl bg-gray-800" />
              ))}
            </div>
          </div>
        ) : weather && (
          <>
            {/* Main Weather Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CloudSun className="w-8 h-8" />
                    <div>
                      <h1 className="text-2xl  font-bold">{weather.name}</h1>
                      <p className="text-gray-400">{weather.condition}</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold">
                    {Math.round(weather.temp)}°C
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-6 h-6" />
                    <div>
                      <p className="text-gray-400">Feels like</p>
                      <p>{Math.round(weather.temp)}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-6 h-6" />
                    <div>
                      <p className="text-gray-400">Humidity</p>
                      <p>{weather.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-6 h-6" />
                    <div>
                      <p className="text-gray-400">Wind</p>
                      <p>{weather.windSpeed} m/s</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-6 h-6" />
                    <div>
                      <p className="text-gray-400">Pressure</p>
                      <p>{weather.pressure} hPa</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Temperature Range */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="w-6 h-6" />
                    Temperature Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Min</span>
                      <span>{Math.round(weather.minTemp)}°C</span>
                    </div>
                    <Progress 
                      value={(weather.temp - weather.minTemp) / (weather.maxTemp - weather.minTemp) * 100}
                      className="h-2 bg-gray-700"
                    />
                    <div className="flex justify-between">
                      <span>Max</span>
                      <span>{Math.round(weather.maxTemp)}°C</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sun Times */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="w-6 h-6" />
                    Sun Times
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sunrise className="w-5 h-5" />
                      Sunrise
                    </div>
                    <span>
                      {new Date(weather.sunrise * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sunset className="w-5 h-5" />
                      Sunset
                    </div>
                    <span>
                      {new Date(weather.sunset * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Coordinates */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="w-6 h-6" />
                    Coordinates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Latitude</span>
                    <span>{weather.lat.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Longitude</span>
                    <span>{weather.lon.toFixed(4)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Icon */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="flex items-center justify-center p-6">
                  <img 
                    src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`} 
                    alt={weather.condition}
                    className="w-32 h-32"
                  />
                </CardContent>
              </Card>

              {/* Wind Direction */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <Navigation className="w-6 h-6" />
                        Wind Direction
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="relative w-32 h-32">
                        {/* Compass Rose */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border-2 border-gray-600">
                            <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs">N</span>
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs">S</span>
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs">W</span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs">E</span>
                            </div>
                        </div>
                        
                        {/* Wind Direction Arrow */}
                        {weather.windDirection && (
                            <div 
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ transform: `rotate(${weather.windDirection}deg)` }}
                            >
                            <Navigation className="w-12 h-12 text-red-200 transition-transform duration-500" />
                            </div>
                        )}
                        </div>

                        {/* Cardinal Direction Text */}
                        {weather.windDirection && (
                        <div className="text-xl font-mono">
                            {getCardinalDirection(weather.windDirection)}
                        </div>
                        )}
                    </CardContent>
                </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}