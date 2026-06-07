import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { createCategory } from "../../../../fns/categories";

export const Route = createFileRoute("/management-portal/dashboard/categories/create")({
  component: CreateCategoryPage,
});

function CreateCategoryPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#E63946");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await createCategory({ data: { name: name.trim(), slug: slug.trim(), description, color } });
      navigate({ to: "/management-portal/dashboard/categories" });
    } catch (err: any) {
      setError(err.message ?? "Failed to save category. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: "/management-portal/dashboard/categories" })}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Category</h1>
            <p className="text-gray-600 mt-1">Add a new content category</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !name.trim() || !slug.trim()}
          className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {saving ? "Saving..." : "Save Category"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., Politics, Business..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            URL Slug <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand overflow-hidden">
            <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-300 select-none">
              /category/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
              }
              placeholder="category-slug"
              className="flex-1 px-4 py-3 font-mono text-sm outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Auto-generated from name. Only lowercase letters, numbers, and hyphens.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of what this category covers..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category Color</label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-12 rounded-lg cursor-pointer border border-gray-300"
            />
            <div className="flex gap-2 flex-wrap">
              {["#E63946","#2563EB","#059669","#EA580C","#9333EA","#DC2626","#0891B2","#65A30D"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  title={c}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        {name && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Preview</p>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {name}
              </span>
              <span className="text-gray-400 text-sm font-mono">/category/{slug}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
