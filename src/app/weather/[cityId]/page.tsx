// app/weather/[cityId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Map from '@/components/Map';
import WeatherForecast from '@/components/WeatherForecast';

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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search city..."
            className="bg-gray-800 border-gray-700 h-10 placeholder-gray-400 text-white"
          />
          <Button type="submit" className="bg-blue-600 h-10  hover:bg-blue-700">
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
                    <CloudSun className="w-8 h-8 text-cyan-400" />
                    <div>
                    <h1 className="text-2xl font-bold text-gray-50">{weather.name}</h1>
                    <p className="text-cyan-400">{weather.condition}</p>
                    </div>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {Math.round(weather.temp)}°C
                </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Thermometer, label: "Feels like", value: `${Math.round(weather.temp)}°C` },
                    { icon: Droplets, label: "Humidity", value: `${weather.humidity}%` },
                    { icon: Wind, label: "Wind", value: `${weather.windSpeed} m/s` },
                    { icon: Gauge, label: "Pressure", value: `${weather.pressure} hPa` }
                ].map((metric, i) => (
                    <div key={i} className="flex items-center gap-2">
                    <metric.icon className="w-6 h-6 text-cyan-400" />
                    <div>
                        <p className="text-gray-400 text-sm font-medium">{metric.label}</p>
                        <p className="text-gray-50">{metric.value}</p>
                    </div>
                    </div>
                ))}
                </div>
            </CardContent>
            </Card>

            {/* Additional Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Temperature Range */}
             <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-50">
                    <Thermometer className="w-6 h-6 text-cyan-400" />
                    Temperature Range
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                    <div className="flex justify-between text-gray-300 text-sm">
                        <span>Min</span>
                        <span>{Math.round(weather.minTemp)}°C</span>
                    </div>
                    <Progress 
                        value={(weather.temp - weather.minTemp) / (weather.maxTemp - weather.minTemp) * 100}
                        className="h-2 bg-gray-700"

                    />
                    <div className="flex justify-between text-gray-300 text-sm">
                        <span>Max</span>
                        <span>{Math.round(weather.maxTemp)}°C</span>
                    </div>
                    </div>
                </CardContent>
             </Card>

              {/* Sun Times */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-50">
                    <Sun className="w-6 h-6 text-amber-400" />
                    Sun Times
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                    { icon: Sunrise, label: "Sunrise", time: weather.sunrise },
                    { icon: Sunset, label: "Sunset", time: weather.sunset }
                    ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-700/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-cyan-300">
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="text-gray-50">
                        {new Date(item.time * 1000).toLocaleTimeString()}
                        </span>
                    </div>
                    ))}
                </CardContent>
               </Card>

              {/* Coordinates */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-50">
                    <Compass className="w-6 h-6 text-green-400" />
                    Coordinates
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {[
                    { label: "Latitude", value: weather.lat.toFixed(4) },
                    { label: "Longitude", value: weather.lon.toFixed(4) }
                    ].map((coord, i) => (
                    <div key={i} className="flex justify-between">
                        <span className="text-gray-400 text-sm">{coord.label}</span>
                        <span className="text-gray-50 font-mono">{coord.value}</span>
                    </div>
                    ))}
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

                <Card className="bg-gray-800 border-gray-700 ">     
                    <CardContent className="m-[-10px]">
                        {weather && (
                        <Map lat={weather.lat} lon={weather.lon}  />
                        )}
                    </CardContent>
                </Card>

              
                {/* Wind Direction */}
                <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-50">
                    <Navigation className="w-6 h-6 text-red-400" />
                    Wind Direction
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border-2 border-gray-600 bg-gray-700/30">
                        {["N", "S", "W", "E"].map((dir, i) => (
                            <span key={dir} className={`absolute text-gray-300 text-xs ${
                            i === 0 ? "top-0 left-1/2 -translate-x-1/2" :
                            i === 1 ? "bottom-0 left-1/2 -translate-x-1/2" :
                            i === 2 ? "left-0 top-1/2 -translate-y-1/2" : "right-0 top-1/2 -translate-y-1/2"
                            }`}>
                            {dir}
                            </span>
                        ))}
                        </div>
                    </div>
                    {weather.windDirection && (
                        <div className="absolute inset-0 flex items-center justify-center"
                        style={{ transform: `rotate(${weather.windDirection}deg)` }}>
                        <Navigation className="w-12 h-12 text-red-400 transition-transform duration-500" />
                        </div>
                    )}
                    </div>
                    {weather.windDirection && (
                    <div className="text-xl font-mono text-cyan-400">
                        {getCardinalDirection(weather.windDirection)}
                    </div>
                    )}
                </CardContent>
                </Card>

                
                
            </div>

          </>

        )}
         <WeatherForecast cityId={cityId} />
      </div>
     
    </div>
  );
}