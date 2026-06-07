import { createFileRoute } from "@tanstack/react-router";
import { Image, Upload, Trash2, Search } from "lucide-react";

export const Route = createFileRoute("/management-portal/dashboard/media")({
  component: MediaPage,
});

function MediaPage() {
  const mediaItems = [
    { id: 1, name: "breaking-news.jpg", size: "2.4 MB", date: "2024-01-15", url: "https://placehold.co/300x200/e63946/white?text=News" },
    { id: 2, name: "business-header.jpg", size: "1.8 MB", date: "2024-01-14", url: "https://placehold.co/300x200/059669/white?text=Business" },
    { id: 3, name: "tech-article.jpg", size: "3.1 MB", date: "2024-01-13", url: "https://placehold.co/300x200/2563eb/white?text=Tech" },
    { id: 4, name: "sports-banner.jpg", size: "2.7 MB", date: "2024-01-12", url: "https://placehold.co/300x200/ea580c/white?text=Sports" },
    { id: 5, name: "politics-cover.jpg", size: "1.9 MB", date: "2024-01-11", url: "https://placehold.co/300x200/dc2626/white?text=Politics" },
    { id: 6, name: "entertainment.jpg", size: "2.2 MB", date: "2024-01-10", url: "https://placehold.co/300x200/9333ea/white?text=Entertainment" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Manage images and media files</p>
        </div>
        <button className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand/90 transition-colors font-semibold">
          <Upload size={20} />
          Upload Media
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search media files..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mediaItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold">View</button>
                <button className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 truncate">{item.name}</h3>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{item.size}</span>
                <span>{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-brand transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-gray-100 p-4 rounded-full">
            <Upload className="text-gray-600" size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Drop files to upload</h3>
            <p className="text-gray-600 mb-4">or click to browse from your computer</p>
            <button className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand/90 transition-colors font-semibold">Choose Files</button>
          </div>
          <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF, WebP (Max 10MB)</p>
        </div>
      </div>
    </div>
  );
}
