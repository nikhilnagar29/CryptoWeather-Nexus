// components/WeatherForecast.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Thermometer, Droplets, Cloud } from 'lucide-react';

interface ForecastData {
  date: number;
  temp: number;
  humidity: number;
}

interface AirQualityData {
  aqi: number;
  components: {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
  };
}

export default function WeatherForecast({ cityId }: { cityId: string }) {
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, airRes] = await Promise.all([
          fetch(`/api/weather/history/${cityId}`),
          fetch(`/api/air_pollution/${cityId}`)
        ]);

        if (!weatherRes.ok || !airRes.ok) throw new Error('Failed to fetch data');
        
        const weatherData = await weatherRes.json();
        const airData = await airRes.json();

        setForecast(weatherData.forecast);
        setAirQuality(airData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityId]);

  const aqiQuality = [
    { label: 'Good', color: 'bg-green-500' },
    { label: 'Fair', color: 'bg-yellow-500' },
    { label: 'Moderate', color: 'bg-orange-500' },
    { label: 'Poor', color: 'bg-red-500' },
    { label: 'Very Poor', color: 'bg-purple-500' }
  ];

  if (error) return <div className="text-red-400 text-center p-4">{error}</div>;

  return (
    <div className="mt-8 space-y-6">
      {/* Temperature & Humidity Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-50">
                    <Thermometer className="w-6 h-6 text-cyan-400" />
                    Temperature Forecast
                </CardTitle>
                </CardHeader>
                <CardContent className="h-64 ml-[-20px]">
                {loading ? (
                    <Skeleton className="h-full w-full bg-gray-700" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                        dataKey="date"
                        tickFormatter={(time) => new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}
                        stroke="#9CA3AF"
                        interval={0}
                        ticks={[
                            forecast[0]?.date,
                            forecast[Math.floor(forecast.length/4)]?.date,
                            forecast[Math.floor(forecast.length/2)]?.date,
                            forecast[Math.floor(3*forecast.length/4)]?.date,
                            forecast[forecast.length-1]?.date
                        ]}
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                        contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                        })}
                        />
                        <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#22D3EE"
                        strokeWidth={2}
                        dot={{ fill: '#1F2937', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        />
                    </LineChart>
                    </ResponsiveContainer>
                )}
                </CardContent>
            </Card>

        <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
                <Droplets className="w-6 h-6 text-blue-400" />
                Humidity Forecast
            </CardTitle>
            </CardHeader>
            <CardContent className="h-64 ml-[-20px]">
            {loading ? (
                <Skeleton className="h-full w-full bg-gray-700" />
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                    dataKey="date"
                    tickFormatter={(time) => new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}
                    stroke="#9CA3AF"
                    interval={0}
                    ticks={[
                        forecast[0]?.date,
                        forecast[Math.floor(forecast.length/4)]?.date,
                        forecast[Math.floor(forecast.length/2)]?.date,
                        forecast[Math.floor(3*forecast.length/4)]?.date,
                        forecast[forecast.length-1]?.date
                    ]}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                    contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                    })}
                    />
                    <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#60A5FA"
                    strokeWidth={2}
                    dot={{ fill: '#1F2937', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    />
                </LineChart>
                </ResponsiveContainer>
            )}
            </CardContent>
        </Card>
    </div>

      {/* Air Quality Section */}
        <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
            <Cloud className="w-6 h-6 text-green-400" />
            Air Quality Analysis
            </CardTitle>
        </CardHeader>
        <CardContent>
            {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-6 w-1/2 bg-gray-700" />
                <Skeleton className="h-4 w-full bg-gray-700" />
                <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-4 bg-gray-700" />
                ))}
                </div>
            </div>
            ) : airQuality && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AQI Overview */}
                <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center 
                    ${aqiQuality[airQuality.aqi - 1].color} shadow-lg`}>
                    <span className="text-gray-900 font-bold text-xl">{airQuality.aqi}</span>
                    </div>
                    <div>
                    <h3 className="text-xl font-semibold text-gray-50 mb-1">
                        {aqiQuality[airQuality.aqi - 1].label}
                    </h3>
                    <p className="text-gray-400 text-sm">Air Quality Index</p>
                    <div className="mt-2 flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${aqiQuality[airQuality.aqi - 1].color} text-gray-900`}>
                        {airQuality.aqi}/5 Scale
                        </span>
                    </div>
                    </div>
                </div>

                {/* Key Pollutants */}
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(airQuality.components).map(([key, value]) => (
                    <div key={key} className="bg-gray-700/30 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-gray-50 font-mono text-sm">{value.toFixed(2)}µg</span>
                        </div>
                        <div className="mt-2 w-full bg-gray-600 rounded-full h-1.5">
                        <div 
                            className="h-1.5 rounded-full bg-cyan-400 transition-all duration-500" 
                            style={{ width: `${Math.min(value / 100, 1) * 100}%` }}
                        ></div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-6">
                <div className="bg-gray-700/30 rounded-xl p-4">
                    <h4 className="text-gray-50 font-medium mb-3">Health Implications</h4>
                    <p className="text-gray-400 text-sm">
                    {[
                        "Good - No health risk",
                        "Fair - Acceptable quality",
                        "Moderate - Sensitive groups affected",
                        "Poor - Health effects possible",
                        "Very Poor - Health warnings"
                    ][airQuality.aqi - 1]}
                    </p>
                </div>

                <div className="space-y-4">
                    <h4 className="text-gray-50 font-medium">Dominant Pollutants</h4>
                    <div className="grid grid-cols-2 gap-4">
                    {Object.entries(airQuality.components)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 2)
                        .map(([key, value]) => (
                        <div key={key} className="bg-gray-700/30 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                            <span className="text-gray-300 text-sm capitalize">{key.replace('_', ' ')}</span>
                            </div>
                            <div className="mt-2 text-gray-50 font-medium">
                            {value.toFixed(2)}µg/m³
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
                </div>
            </div>
            )}
        </CardContent>
        </Card>
    </div>
  );
}