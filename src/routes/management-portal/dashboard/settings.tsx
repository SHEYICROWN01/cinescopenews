import { createFileRoute } from "@tanstack/react-router";
import { Globe, Shield, Palette } from "lucide-react";

export const Route = createFileRoute("/management-portal/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your site preferences and options</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Globe className="text-blue-600" size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">General Settings</h2>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input type="text" defaultValue="News Canvas" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Tagline</label>
              <input type="text" defaultValue="Nigeria's Premier News Source" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
            <textarea rows={3} defaultValue="Breaking news, analysis, and commentary from Nigeria and around the world." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-lg">
            <Palette className="text-orange-600" size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Appearance</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
          <div className="flex gap-2">
            <input type="color" className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer" defaultValue="#E63946" />
            <input type="text" placeholder="#E63946" defaultValue="#E63946" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Shield className="text-yellow-600" size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Security</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <button className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors font-semibold text-sm">Enable 2FA</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Change Password</p>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm">Change</button>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="bg-brand text-white px-8 py-3 rounded-lg hover:bg-brand/90 transition-colors font-semibold">Save All Settings</button>
        <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold">Reset to Defaults</button>
      </div>
    </div>
  );
}
