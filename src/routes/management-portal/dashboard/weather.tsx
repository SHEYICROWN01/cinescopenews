import { createFileRoute } from "@tanstack/react-router";
import { Cloud, CloudRain, Sun, Wind } from "lucide-react";

export const Route = createFileRoute("/management-portal/dashboard/weather")({
  component: WeatherPage,
});

function WeatherPage() {
  const cities = [
    { name: "Lagos", temp: "29°C", condition: "Partly Cloudy", humidity: "75%", wind: "12 km/h", icon: Cloud },
    { name: "Abuja", temp: "32°C", condition: "Sunny", humidity: "45%", wind: "8 km/h", icon: Sun },
    { name: "Port Harcourt", temp: "28°C", condition: "Rainy", humidity: "85%", wind: "15 km/h", icon: CloudRain },
    { name: "Kano", temp: "35°C", condition: "Hot & Dry", humidity: "30%", wind: "10 km/h", icon: Sun },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Weather Data</h1>
        <p className="text-gray-600 mt-1">Configure weather API and manage displayed cities</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">API Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weather Provider</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand">
              <option>OpenWeatherMap (Free)</option>
              <option>WeatherAPI.com (Free)</option>
              <option>AccuWeather</option>
              <option>Tomorrow.io</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <input
              type="password"
              placeholder="Enter your API key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Update Frequency</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand">
              <option>Every 30 minutes</option>
              <option>Every 1 hour</option>
              <option>Every 3 hours</option>
              <option>Every 6 hours</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand/90 transition-colors font-semibold">
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Weather Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <div key={city.name} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{city.name}</h3>
                <city.icon className="text-blue-600" size={32} />
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{city.temp}</div>
                <div className="text-sm text-gray-600">{city.condition}</div>
                <div className="pt-4 mt-4 border-t border-gray-200 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Humidity</span>
                    <span className="font-semibold text-gray-900">{city.humidity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Wind</span>
                    <span className="font-semibold text-gray-900">{city.wind}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Display Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Show on Homepage</p>
              <p className="text-sm text-gray-600">Display weather widget on the homepage</p>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-brand transition-colors cursor-pointer"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto-Update</p>
              <p className="text-sm text-gray-600">Automatically fetch new weather data</p>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-brand transition-colors cursor-pointer"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
