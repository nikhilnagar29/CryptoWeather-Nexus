'use client';

import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import CityWeather from './components/CityWeather';
import AirPollution from './components/AirPollution';
import CryptoNewsFeed from './components/CryptoNewsFeed';
import NewsSearch from './components/NewsSearch';
async function getWeatherData() {
  const res = await fetch('/api/weather', {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  return res.json();
}

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any[]>([]);

  // Fetch initial weather data
  useEffect(() => {
    getWeatherData().then(setWeatherData);
  }, []);

  const handleSearch = (cityId: string) => {
    setSelectedCity(cityId);
  };

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">News Search</h1>
      <NewsSearch />

        <h1 className="text-3xl font-bold text-center">Crypto News</h1>
        <CryptoNewsFeed />
        <h1 className="text-3xl font-bold text-center">Weather Dashboard</h1>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weatherData.map((city) => (
              <div
                key={city.id}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setSelectedCity(city.id)}
              >
                <h2 className="text-xl font-semibold">{city.name}</h2>
                <p className="text-3xl font-bold">{Math.round(city.temp)}°C</p>
                <p>Humidity: {city.humidity}%</p>
                <p>Condition: {city.condition}</p>
                <p>Wind Speed: {city.windSpeed} m/s</p>
              </div>
            ))}
          </div>
        
        <div className="flex justify-center">
          <SearchBar onSearch={handleSearch} />
        </div>

        {selectedCity && <CityWeather cityId={selectedCity} />}
        {selectedCity && <AirPollution cityId={selectedCity} />}
        
      </main>
    </div>
  );
} 