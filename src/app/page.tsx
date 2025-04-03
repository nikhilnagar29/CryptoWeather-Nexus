'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from './components/SearchBar';
import CityWeather from './components/CityWeather';
import AirPollution from './components/AirPollution';
import CryptoNewsFeed from './components/CryptoNewsFeed';
import NewsSearch from './components/NewsSearch';
import CryptoChart from '@/components/CryptoChart';
import CryptoList from '@/components/CryptoList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiDogecoin, SiSolana } from 'react-icons/si';

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
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');

  // Fetch initial weather data
  useEffect(() => {
    getWeatherData().then(setWeatherData);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setSelectedCity(search);
      router.push(`/weather/${encodeURIComponent(search)}`);
    }
  };

  
  return (
    <div className="min-h-screen p-8 bg-gray-900">
      <div className="max-w-5xl mx-auto space-y-8">
        <main className="max-w-6xl mx-auto space-y-8">
          
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city..."
              className="bg-gray-800 border-gray-700 h-10 placeholder-gray-400 text-white"
            />
            <Button type="submit" className="bg-blue-600 h-10 hover:bg-blue-700">
              Search
            </Button>
          </form>

          

          <div className="justify-center gap-4 grid grid-cols-1 md:grid-cols-2">
          
            <CryptoList />

            
            <div className="grid grid-cols-1 gap-4">
              {weatherData.map((city) => (
                <div
                  key={city.id}
                  className="p-6 bg-gray-800 dark:bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => handleSearch(city.name)}
                >
                  <h2 className="text-xl text-white font-semibold">{city.name}</h2>
                  <p className="text-3xl text-green-600 font-bold">{Math.round(city.temp)}°C</p>
                  <p className="text-white">Humidity: {city.humidity}%</p>
                  <p className="text-white">Condition: {city.condition}</p>
                  <p className="text-white">Wind Speed: {city.windSpeed} m/s</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <CryptoChart cryptoId="bitcoin" />
          </div>
          
          <CryptoNewsFeed />
          
          <NewsSearch />
          
        </main>
      </div>
    </div>
  );
} 