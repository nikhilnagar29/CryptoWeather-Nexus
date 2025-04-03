"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiDogecoin } from "react-icons/si";

const CRYPTO_PAIRS = [
  "btcusdt", "ethusdt", "bnbusdt", "xrpusdt", "adausdt", 
  "dogeusdt", "solusdt", "dotusdt", "ltcusdt"
];

const CRYPTO_PAIRS_MAP: Record<string, string> = {
  "btcusdt": "bitcoin",
  "ethusdt": "ethereum",
  "bnbusdt": "binance coin",
  "xrpusdt": "xrp",
  "adausdt": "ada",
  "dogeusdt": "dogecoin",
  "solusdt": "solana",
  "ltcusdt": "litecoin",
  "dotusdt": "polkadot",
};

const SOCKET_URL = "wss://stream.binance.com:9443/ws";

export default function LiveCryptoPrices() {
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;

    const connectWebSocket = () => {
      ws = new WebSocket(SOCKET_URL);

      ws.onopen = () => {
        console.log("WebSocket Connected");
        ws.send(
          JSON.stringify({
            method: "SUBSCRIBE",
            params: CRYPTO_PAIRS.map((pair) => `${pair}@trade`),
            id: 1,
          })
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.e === "trade") {
          setPrices((prevPrices) => ({
            ...prevPrices,
            [data.s]: parseFloat(data.p).toFixed(4),
          }));
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      ws.onclose = () => {
        console.warn("WebSocket Disconnected. Reconnecting...");
        setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
      };

      setSocket(ws);
    };

    connectWebSocket();

    return () => {
      ws.close();
    };
  }, []);

  // Function to handle crypto button clicks
  const handleCryptoRedirect = (crypto: string) => {
    router.push(`/crypto/${crypto}`);
  };

  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
      {/* Crypto Buttons */}
      <div className="flex justify-center gap-5 mb-4">
        <Button 
          onClick={() => handleCryptoRedirect('bitcoin')} 
          className="flex-1 md:flex-none bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl"
        >
          <FaBitcoin className="inline-block mr-2" /> Bitcoin
        </Button>
        <Button 
          onClick={() => handleCryptoRedirect('dogecoin')} 
          className="flex-1 md:flex-none bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl"
        >
          <SiDogecoin className="inline-block mr-2" /> Dogecoin
        </Button>
        <Button 
          onClick={() => handleCryptoRedirect('ethereum')} 
          className="flex-1 md:flex-none bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl"
        >
          <FaEthereum className="inline-block mr-2" /> Ethereum
        </Button>
      </div>


      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="p-2 border-b text-white">Pair</th>
            <th className="p-2 border-b text-white">Price (USDT)</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          {CRYPTO_PAIRS.map((pair) => (
            <tr key={pair!} className="text-gray-600">
              <td className="p-2 border-b font-semibold text-gray-100" onClick={() => {
                if (CRYPTO_PAIRS_MAP[pair!] === "bitcoin" || CRYPTO_PAIRS_MAP[pair!] === "ethereum" || CRYPTO_PAIRS_MAP[pair!] === "solana") {
                  router.push(`/crypto/${encodeURIComponent(CRYPTO_PAIRS_MAP[pair!])}`);
                } 
              }}>{pair!.toUpperCase()}</td>
              <td className="p-2 border-b text-green-600 ">
                {prices[pair!.toUpperCase()] || "Loading..."}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
