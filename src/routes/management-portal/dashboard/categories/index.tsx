import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Folder, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { getCategories, deleteCategory } from "../../../../fns/categories";
import type { Category } from "../../../../db/schema";

export const Route = createFileRoute("/management-portal/dashboard/categories/")({
  loader: () => getCategories(),
  component: CategoriesPage,
});

function CategoriesPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const categories = Route.useLoaderData() as Category[];
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteCategory({ data: id });
      router.invalidate();
    } catch {
      alert("Failed to delete category. It may be in use by articles.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">
            {categories.length} {categories.length === 1 ? "category" : "categories"} total
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/management-portal/dashboard/categories/create" })}
          className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand/90 transition-colors font-semibold"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Folder size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No categories yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first category to start organising articles.</p>
          <button
            onClick={() => navigate({ to: "/management-portal/dashboard/categories/create" })}
            className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-lg hover:bg-brand/90 font-semibold text-sm"
          >
            <Plus size={16} /> Create Category
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Slug</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Color</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Description</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: category.color + "20" }}
                        >
                          <Folder size={18} style={{ color: category.color }} />
                        </div>
                        <span className="font-semibold text-gray-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 font-mono text-sm">/{category.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-500 font-mono">{category.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-sm line-clamp-1">
                        {category.description || <span className="text-gray-300 italic">No description</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate({ to: "/management-portal/dashboard/categories/create" })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={17} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          disabled={deletingId === category.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          {deletingId === category.id
                            ? <Loader2 size={17} className="animate-spin" />
                            : <Trash2 size={17} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
