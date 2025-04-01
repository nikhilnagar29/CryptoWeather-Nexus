'use client';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { format } from 'date-fns';

Chart.register(...registerables);

interface WeatherData {
  id: string;
  name: string;
  temp: number;
  humidity: number;
  condition: string;
  icon: string;
  windSpeed: number;
}

interface ForecastData {
  date: number;
  temp: number;
  humidity: number;
  condition: string;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: 'Weather Data' }
  },
  scales: {
    x: { title: { display: true, text: 'Time' } },
    y: { title: { display: true, text: 'Value' } }
  }
};

export default function CityWeather({ cityId }: { cityId: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [history, setHistory] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch current weather and forecast
        const weatherRes = await fetch(`/api/weather/${cityId}`);
        if (!weatherRes.ok) throw new Error('Failed to fetch weather data');
        const weatherData = await weatherRes.json();
        setWeather(weatherData);

        // Fetch historical data
        const historyRes = await fetch(`/api/weather/history/${cityId}`);
        if (!historyRes.ok) throw new Error('Failed to fetch historical data');
        const historyData = await historyRes.json();
        setForecast(historyData.forecast || []);

        setHistory(historyData.forecast || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cityId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-800 shadow-lg rounded-xl max-w-6xl mx-auto text-white">
      {/* Current Weather Section */}
      {weather && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold">{weather.name}</h2>
              <p className="text-2xl">{Math.round(weather.temp)}°C</p>
              <p className="text-gray-400 capitalize">{weather.condition}</p>
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.condition}
              className="w-24 h-24"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-400">Humidity</p>
              <p className="text-xl font-semibold">{weather.humidity}%</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-400">Wind Speed</p>
              <p className="text-xl font-semibold">{weather.windSpeed} m/s</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-400">Feels Like</p>
              <p className="text-xl font-semibold">{Math.round(weather.temp)}°C</p>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Charts */}
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">5-Day Temperature Forecast</h3>
          <div className="h-64">
            <Line
              data={{
                labels: forecast.map((f) => format(new Date(f.date), 'MM/dd HH:mm')),
                datasets: [{
                  label: 'Temperature (°C)',
                  data: forecast.map((f) => f.temp),
                  borderColor: 'rgb(255, 99, 132)',
                  backgroundColor: 'rgba(255, 99, 132, 0.5)',
                  tension: 0.3,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">5-Day Humidity Forecast</h3>
          <div className="h-64">
            <Line
              data={{
                labels: forecast.map((f) => format(new Date(f.date), 'MM/dd HH:mm')),
                datasets: [{
                  label: 'Humidity (%)',
                  data: forecast.map((f) => f.humidity),
                  borderColor: 'rgb(54, 162, 235)',
                  backgroundColor: 'rgba(54, 162, 235, 0.5)',
                  tension: 0.3,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        
      </div>
    </div>
  );
}