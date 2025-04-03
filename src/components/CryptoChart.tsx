'use client';

import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CryptoChartProps {
  cryptoId: string;
}

// Socket URL for price updates
const SOCKET_URL = 'wss://stream.binance.com:9443/ws';

const CryptoChart = ({ cryptoId = 'bitcoin' }: CryptoChartProps) => {
  // State for chart data
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<number>(7);
  
  // State for real-time price data from socket
  const [priceData, setPriceData] = useState<{
    price: string;
    changePercent: string;
    lastUpdated: Date;
  } | null>(null);

  // Refs for socket connection and data caching
  const socketRef = useRef<WebSocket | null>(null);
  const cachedChartDataRef = useRef<{[key: string]: {data: any[], timestamp: number}}>({});
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  
  // Ensure cryptoId is always a valid string
  const safeId = cryptoId || 'bitcoin';
  
  const fetchChartData = async () => {
    try {
      setLoading(true);
  
      const response = await fetch(`/api/crypto/chat?cryptoId=${safeId}&days=${days}`);
  
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      setChartData(data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp: new Date(timestamp).toLocaleDateString(),
        price,
      })));
  
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError("Failed to load chart data.");
    } finally {
      setLoading(false);
    }
  };
  

  // Function to establish socket connection
  const connectWebSocket = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return; // Socket is already open
    }
    
    try {
      // Close existing socket if any
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      // Create new socket connection
      const ws = new WebSocket(SOCKET_URL);
      socketRef.current = ws;
      
      // Convert cryptoId to Binance symbol format (e.g., bitcoin -> btcusdt)
      const symbol = safeId === 'bitcoin' ? 'btcusdt' : 
                    safeId === 'ethereum' ? 'ethusdt' : 
                    `${safeId.toLowerCase()}usdt`;
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts counter
        
        // Subscribe to ticker stream for real-time price updates
        const subscribeMsg = JSON.stringify({
          method: 'SUBSCRIBE',
          params: [`${symbol}@ticker`],
          id: 1
        });
        
        ws.send(subscribeMsg);
      };
      
      ws.onmessage = (event) => {
        try {
          // Check if message is valid JSON
          if (typeof event.data !== 'string') return;
          
          const message = JSON.parse(event.data);
          
          // Handle subscription confirmation
          if (message.id === 1) {
            if (message.result === null) {
              console.log('Subscription successful');
            } else {
              console.error('Subscription error:', message.error);
            }
            return;
          }
          // Check if this is ticker data (not a subscription response)
          if (message.e === '24hrTicker') {
            const price = parseFloat(message.c);
            const formattedPrice = (price).toString();
            const changePercent = parseFloat(message.P).toFixed(2);
            
            setPriceData({
              price: formattedPrice,
              changePercent: `${changePercent}%`,
              lastUpdated: new Date()
            });
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        handleReconnect();
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Socket error will trigger onclose event too
      };
      
    } catch (err) {
      console.error('Error establishing WebSocket connection:', err);
      handleReconnect();
    }
  };
  
  // Handle reconnection with exponential backoff
  const handleReconnect = () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }
    
    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    const backoffTime = Math.min(1000 * (2 ** reconnectAttemptsRef.current), 30000);
    console.log(`Attempting to reconnect in ${backoffTime}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      connectWebSocket();
    }, backoffTime);
  };
  
  // Initialize and fetch data
  useEffect(() => {
    fetchChartData();
    connectWebSocket();
    
    // Set up interval to refresh chart data periodically (every 5 minutes)
    const chartRefreshInterval = setInterval(fetchChartData, 5 * 60 * 1000);
    
    // Cleanup function
    return () => {
      clearInterval(chartRefreshInterval);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        // Properly unsubscribe and close socket
        const symbol = safeId === 'bitcoin' ? 'btcusdt' : 
                    safeId === 'ethereum' ? 'ethusdt' : 
                    `${safeId.toLowerCase()}usdt`;
                    
        const unsubscribeMsg = JSON.stringify({
          method: 'UNSUBSCRIBE',
          params: [`${symbol}@ticker`],
          id: 2
        });
        
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(unsubscribeMsg);
          socketRef.current.close();
        }
      }
    };
  }, [safeId, days]);
  
  // Format large numbers for display with K format (e.g., 1000 -> $1k)
  const formatKPrice = (price: number) => {
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}k`;
    }
    return `$${price.toFixed(2)}`;
  };
  
  // Format price for chart display
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}k`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Generate formatted title with proper capitalization
  const getFormattedTitle = () => {
    if (!safeId) return "Cryptocurrency Price Chart";
    return `${safeId.charAt(0).toUpperCase() + safeId.slice(1)} Price Chart`;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{getFormattedTitle()}</h2>
        
        {/* Price Display from WebSocket */}
        <div className="flex flex-col items-end">
          {priceData ? (
            <>
              <span className="text-3xl font-bold text-white">{priceData.price}</span>
              <span className={`text-sm ${parseFloat(priceData.changePercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceData.changePercent}
              </span>
            </>
          ) : (
            <span className="text-gray-400">Loading price data...</span>
          )}
        </div>
      </div>
      
      {/* Time range selector */}
      <div className="flex mb-4 space-x-2">
        {[1, 7, 30, 90, 365].map((interval) => (
          <button
            key={interval}
            className={`px-3 py-1 rounded ${days === interval ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setDays(interval)}
          >
            {interval === 1 ? '1D' : interval === 7 ? '1W' : interval === 30 ? '1M' : interval === 90 ? '3M' : '1Y'}
          </button>
        ))}
      </div>
      
      {/* Chart */}
      <div className="h-72">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Loading chart data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fill: '#ccc' }} 
                tickLine={{ stroke: '#ccc' }} 
                axisLine={{ stroke: '#ccc' }}
                minTickGap={30}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fill: '#ccc' }} 
                tickLine={{ stroke: '#ccc' }} 
                axisLine={{ stroke: '#ccc' }}
                tickFormatter={formatPrice}
              />
              <Tooltip 
                formatter={(value: number) => [formatPrice(value), 'Price']} 
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                itemStyle={{ color: '#60a5fa' }}
                labelStyle={{ color: 'white' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#60a5fa" 
                dot={false} 
                strokeWidth={2} 
                activeDot={{ r: 6 }} 
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-red-400">No chart data available</p>
          </div>
        )}
      </div>

      {/* Error message if applicable */}
      {error && (
        <div className="mt-4 p-2 bg-red-900 bg-opacity-40 text-red-300 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default CryptoChart;