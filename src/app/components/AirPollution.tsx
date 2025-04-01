'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

interface AirPollutionData {
  aqi: number;
  components: { [key: string]: number };
}

export default function AirPollution({ cityId }: { cityId: string }) {
  const [pollution, setPollution] = useState<AirPollutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPollutionData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/air_pollution/${cityId}`);
        if (!res.ok) throw new Error('Failed to fetch air pollution data');
        const data = await res.json();
        setPollution(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPollutionData();
  }, [cityId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const aqiDescriptions = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  const aqiColors = ['green', 'yellow', 'orange', 'red', 'purple'];
  const aqiLevel = pollution ? pollution.aqi : 1;

  return (
    <div className="p-6 bg-gray-700 shadow-md rounded-lg">
      <h2 className="text-xl font-bold text-white">Air Quality in {cityId}</h2>
      <p className="text-white">
        AQI Level: <span style={{ color: aqiColors[aqiLevel - 1] }}>{aqiDescriptions[aqiLevel - 1]}</span>
      </p>

      <h3 className="text-lg font-semibold mt-4 text-white">Pollutant Levels</h3>
      {pollution && (
        <Bar
          data={{
            labels: Object.keys(pollution.components),
            datasets: [
              {
                label: 'Concentration (µg/m³)',
                data: Object.values(pollution.components),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
              },
            ],
          }}
        />
      )}
    </div>
  );
}
