# CryptoWeather-Nexus

CryptoWeather-Nexus is a web application that provides real-time weather, air pollution data, live cryptocurrency prices, and news updates. The app utilizes multiple APIs to deliver up-to-date information on different domains.

## 🌟 Features

- **🌦 Weather & Air Pollution Data:** Get real-time weather conditions and air pollution levels for any city.
- **📈 Cryptocurrency Data:** View details about cryptocurrencies, including live prices and historical trends.
- **📰 News Search & Crypto News:** Search for news related to any topic, including crypto-specific news.
- **🔗 WebSocket Integration:** Live crypto prices via WebSocket for real-time updates.

---

## 🔧 Technologies & APIs Used

- **OpenWeatherMap API:** [https://openweathermap.org/api](https://openweathermap.org/api) (Weather & Air Pollution Data)
- **CoinGecko API:** [https://www.coingecko.com/en/api](https://www.coingecko.com/en/api) (Crypto Data & Historical Prices)
- **Binance WebSocket:** Live cryptocurrency price updates.
- **NewsData.io API:** [https://newsdata.io/](https://newsdata.io/) (News Search & Crypto News)
- **Next.js** for frontend and API routes.
- **TypeScript & Tailwind CSS** for styling and development.

---

## 🛠 Setup Instructions

### 1️⃣ Clone the Repository

```sh
 git clone https://github.com/nikhilnagar29/CryptoWeather-Nexus.git
 cd CryptoWeather-Nexus
```

### 2️⃣ Create Environment Variables

Create a `.env.local` file in the root directory and add the following keys:

```ini
OPENWEATHER_API_KEY=your_api_key_here
NEWSDATA_API_KEY=your_api_key_here
```

### 3️⃣ Install Dependencies & Run the App

```sh
npm install
npm run dev
```

The app will be available at **`http://localhost:3000/`**.

---

## 🔗 Live Demo

You can access the live version at **[CryptoWeather-Nexus](https://crypto-weather-nexus-rq28.vercel.app/)**

---

## 📌 Key Pages & Features

### **🌍 Weather & Crypto Overview**

- Displays temperatures of different cities and live prices of various cryptocurrencies.
- News related to cryptocurrencies.

![Weather & Crypto Overview](/public/img1.png)

### **📊 Cryptocurrency Details**

- Access details about a specific cryptocurrency by visiting:
  ```
  http://localhost:3000/crypto/[coin]
  ```
- Example: **Bitcoin details:** `http://localhost:3000/crypto/bitcoin`

![Crypto Details](/public/img2.png)

### **🌦 City Weather & Air Pollution Details**

- Get complete weather details and air pollution levels for any location.
- URL Format:
  ```
  https://crypto-weather-nexus-rq28.vercel.app/weather/[city]
  ```
- Example: **Weather in New York:** `https://crypto-weather-nexus-rq28.vercel.app/weather/new-york`

![City Weather](/public/img3.png)

---

## 🚀 Future Enhancements

- Add more cryptocurrencies and improve the UI.
- Implement user authentication for personalized dashboards.
- Add multi-language support.

---

## 👨‍💻 Author

Developed by **Nikhil Nagar**

📧 Contact: [Email](mailto:nikhilnagar@example.com) | [GitHub](https://github.com/nikhilnagar29)

---

_Enjoy using CryptoWeather-Nexus! 🚀_
