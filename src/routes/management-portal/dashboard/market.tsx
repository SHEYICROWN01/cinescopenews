import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, DollarSign, Coins, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/management-portal/dashboard/market")({
  component: MarketPage,
});

function MarketPage() {
  const marketData = [
    { symbol: "USD/NGN", name: "US Dollar", rate: "₦755.50", change: "+0.5%", trend: "up" },
    { symbol: "GBP/NGN", name: "British Pound", rate: "₦985.20", change: "+0.8%", trend: "up" },
    { symbol: "EUR/NGN", name: "Euro", rate: "₦825.30", change: "-0.2%", trend: "down" },
    { symbol: "BTC", name: "Bitcoin", rate: "$67,450", change: "+2.3%", trend: "up" },
    { symbol: "ETH", name: "Ethereum", rate: "$3,280", change: "+1.8%", trend: "up" },
    { symbol: "GOLD", name: "Gold (oz)", rate: "$2,345", change: "+0.3%", trend: "up" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Market Data</h1>
          <p className="text-gray-600 mt-1">Manage forex, cryptocurrency, and commodity prices</p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
          <RefreshCw size={20} />
          Update Rates
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">API Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Forex & Commodities</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand">
                  <option>ExchangeRate-API (Free)</option>
                  <option>Fixer.io</option>
                  <option>CurrencyAPI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input type="password" placeholder="Enter API key" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Cryptocurrency</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand">
                  <option>CoinGecko (Free)</option>
                  <option>CoinMarketCap</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input type="password" placeholder="Enter API key" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand/90 transition-colors font-semibold">Save Configuration</button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Rates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketData.map((item) => (
            <div key={item.symbol} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {item.symbol.includes('BTC') || item.symbol.includes('ETH') ? <Coins className="text-orange-500" size={24} /> : <DollarSign className="text-green-500" size={24} />}
                  <div>
                    <div className="font-bold text-gray-900">{item.symbol}</div>
                    <div className="text-xs text-gray-600">{item.name}</div>
                  </div>
                </div>
                {item.trend === 'up' ? <TrendingUp className="text-green-600" size={20} /> : <TrendingDown className="text-red-600" size={20} />}
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">{item.rate}</div>
                <div className={`text-sm font-semibold ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{item.change} (24h)</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">📌 Recommended Free APIs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-blue-900">Forex & Commodities:</p>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• ExchangeRate-API.com (1,500 requests/month free)</li>
              <li>• CurrencyAPI.com (300 requests/month free)</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-blue-900">Cryptocurrency:</p>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• CoinGecko API (Unlimited free tier)</li>
              <li>• CoinCap API (Unlimited free tier)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
