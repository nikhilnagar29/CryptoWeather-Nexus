// hooks/useSocket.ts
import { useEffect, useState } from 'react';
import io  from "socket.io-client";

// Define event interfaces
interface ServerToClientEvents {
  price_update: (data: {
    crypto: string;
    price: number;
    change_24h: number;
  }) => void;
  price_alert: (alert: {
    type: string;
    crypto: string;
    price: number;
    previous: number;
    change: string;
  }) => void;
}

interface ClientToServerEvents {
  subscribe_crypto: (cryptoId: string) => void;
}

interface Data {
    crypto: string;
    price: number;
    change_24h: number; 
}

interface Alert {
    type: string;
    crypto: string;
    price: number;
    previous: number;
    change: string;
}

export function useSocket() {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [priceData, setPriceData] = useState<Record<string, Data>>({});
  const [priceAlerts, setPriceAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Initialize socket connection
    const socketInit = async () => {
      await fetch('/api/socket');
      const socketInstance = io();
      setSocket(socketInstance);
      
      // Listen for price updates
      socketInstance.on('price_update', (data: Data) => {
        setPriceData(prev => ({
          ...prev,
          [data.crypto]: data
        }));
      });
      
      // Listen for price alerts
      socketInstance.on('price_alert', (alert: Alert) => {
        setPriceAlerts(prev => [alert, ...prev].slice(0, 10)); // Keep most recent 10 alerts
      });
      
      // Subscribe to specific cryptocurrencies
      ['bitcoin', 'ethereum', 'dogecoin'].forEach(crypto => {
        socketInstance.emit('subscribe_crypto', crypto);
      });
    };
    
    socketInit();
    
    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return { socket, priceData, priceAlerts };
}
