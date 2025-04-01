// app/api/socket/route.ts
import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/next';

// Define which cryptocurrencies to track for real-time updates
const TRACKED_CRYPTOS = ['bitcoin', 'ethereum', 'dogecoin'];

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('Socket server already running');
  } else {
    console.log('Initializing socket server');
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    // Initialize last prices to track changes
    let lastPrices: Record<string, number> = {};

    // Function to fetch latest prices
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${TRACKED_CRYPTOS.join(',')}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check for significant price changes (> 0.5%)
        Object.entries(data).forEach(([crypto, values]: [string, any]) => {
          const currentPrice = values.usd;
          
          // Skip if no previous price recorded
          if (!lastPrices[crypto]) {
            lastPrices[crypto] = currentPrice;
            return;
          }
          
          const priceChange = ((currentPrice - lastPrices[crypto]) / lastPrices[crypto]) * 100;
          
          // If change is significant, emit an event
          if (Math.abs(priceChange) >= 0.5) {
            io.emit('price_alert', {
              type: 'price_alert',
              crypto: crypto,
              price: currentPrice,
              previous: lastPrices[crypto],
              change: priceChange.toFixed(2)
            });
          }
          
          // Always emit current price for real-time updates
          io.emit('price_update', {
            crypto: crypto,
            price: currentPrice,
            change_24h: values.usd_24h_change
          });
          
          // Update last price
          lastPrices[crypto] = currentPrice;
        });
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    // Poll for price updates (every 30 seconds)
    const priceUpdateInterval = setInterval(fetchPrices, 30000);

    // Handle client connections
    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Send initial prices on connection
      fetchPrices();
      
      // Handle specific crypto subscription
      socket.on('subscribe_crypto', (cryptoId) => {
        if (TRACKED_CRYPTOS.includes(cryptoId)) {
          socket.join(`crypto_${cryptoId}`);
          console.log(`Client ${socket.id} subscribed to ${cryptoId}`);
        }
      });
      
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    // Clean up on server close
    res.socket.server.on('close', () => {
      clearInterval(priceUpdateInterval);
    });
  }
  
  res.end();
}

// You'll need to extend the NextApiResponse type
// Create a file: types/next.ts
// export interface NextApiResponseServerIO extends NextApiResponse {
//   socket: Socket & {
//     server: Server & {
//       io: SocketIOServer;
//     };
//   };
// }
