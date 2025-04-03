import WebSocket, { Server } from "ws";

const wss = new Server({ port: 8080 });

const CRYPTO_PAIRS = [
  "btcusdt", "ethusdt", "bnbusdt", "xrpusdt", "adausdt",
  "dogeusdt", "solusdt", "dotusdt", "ltcusdt"
];

const BINANCE_WS = "wss://stream.binance.com:9443/ws";

const binanceSocket = new WebSocket(BINANCE_WS);

binanceSocket.on("open", () => {
  console.log("Connected to Binance WebSocket");

  binanceSocket.send(
    JSON.stringify({
      method: "SUBSCRIBE",
      params: CRYPTO_PAIRS.map((pair) => `${pair}@trade`),
      id: 1,
    })
  );
});

binanceSocket.on("message", (data: string) => {
  const parsedData = JSON.parse(data);
  if (parsedData.e === "trade") {
    const message = {
      pair: parsedData.s,
      price: parseFloat(parsedData.p).toFixed(4),
    };

    wss.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
});

wss.on("connection", (ws: any) => {
  console.log("New client connected");
  ws.on("close", () => console.log("Client disconnected"));
});

console.log("WebSocket server running on ws://localhost:8080");
