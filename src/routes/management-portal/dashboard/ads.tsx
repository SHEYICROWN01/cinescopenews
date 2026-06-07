import { createFileRoute } from "@tanstack/react-router";
import { Monitor, Plus, Edit, Trash2 } from "lucide-react";

export const Route = createFileRoute("/management-portal/dashboard/ads")({
  component: AdsPage,
});

function AdsPage() {
  const ads = [
    { id: 1, title: "Bank of Nigeria", position: "Billboard", status: "Active", clicks: 12420, revenue: "₦450,000", endDate: "2024-03-31" },
    { id: 2, title: "Dangote Group", position: "Leaderboard", status: "Active", clicks: 8950, revenue: "₦350,000", endDate: "2024-04-15" },
    { id: 3, title: "MTN Nigeria", position: "MPU", status: "Active", clicks: 6730, revenue: "₦280,000", endDate: "2024-05-01" },
    { id: 4, title: "Guaranty Trust Bank", position: "Half-Page", status: "Scheduled", clicks: 0, revenue: "₦320,000", endDate: "2024-06-01" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advertisements</h1>
          <p className="text-gray-600 mt-1">Manage custom advertisement placements</p>
        </div>
        <button className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand/90 transition-colors font-semibold">
          <Plus size={20} />
          New Advertisement
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Advertiser</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Position</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Clicks</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Revenue</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">End Date</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{ad.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">{ad.position}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${ad.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-semibold">{ad.clicks.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-semibold">{ad.revenue}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{ad.endDate}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
