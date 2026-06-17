import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Search, Edit, Trash2, Plus, FileText, Loader2, Zap, Star, Eye, Link2, Check, Globe } from "lucide-react";
import { useState } from "react";
import { getArticles, deleteArticle } from "../../../../fns/articles";

export const Route = createFileRoute("/management-portal/dashboard/articles/")({
  loader: () => getArticles(),
  component: ArticlesPage,
});

function ArticlesPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const articles = Route.useLoaderData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  function handleCopyLink(id: number, slug: string) {
    const url = `https://www.cinescopenews.com.ng/article/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const filtered = articles.filter((a) => {
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.author ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteArticle({ data: id });
      router.invalidate();
    } catch {
      alert("Failed to delete article.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-1">
            {articles.length} {articles.length === 1 ? "article" : "articles"} total
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/management-portal/dashboard/articles/create" })}
          className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand/90 transition-colors font-semibold"
        >
          <Plus size={20} />
          Create Article
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Empty state */}
      {articles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No articles yet</h3>
          <p className="text-gray-500 text-sm mb-6">Write your first article to get started.</p>
          <button
            onClick={() => navigate({ to: "/management-portal/dashboard/articles/create" })}
            className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-lg hover:bg-brand/90 font-semibold text-sm"
          >
            <Plus size={16} /> Create Article
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No articles match your search.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Article</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Author</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Views</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-start gap-2">
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                            {article.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {article.isBreaking && (
                              <span className="flex items-center gap-0.5 text-xs font-bold text-red-600">
                                <Zap size={10} /> Breaking
                              </span>
                            )}
                            {article.isFeatured && (
                              <span className="flex items-center gap-0.5 text-xs font-bold text-yellow-600">
                                <Star size={10} /> Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {article.categoryName ? (
                        <span
                          className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: article.categoryColor ?? "#6b7280" }}
                        >
                          {article.categoryName}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Uncategorised</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{article.author || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Eye size={13} className="text-gray-400" />
                        <span className="font-semibold">
                          {(article.views ?? 0) >= 1000
                            ? `${((article.views ?? 0) / 1000).toFixed(1)}K`
                            : (article.views ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        article.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {article.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : new Date(article.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {article.status === "published" && article.slug && (
                          <>
                            <a
                              href={`https://www.cinescopenews.com.ng/article/${article.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View on site"
                            >
                              <Globe size={16} />
                            </a>
                            <button
                              onClick={() => handleCopyLink(article.id, article.slug!)}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                              title={copiedId === article.id ? "Copied!" : "Copy link"}
                            >
                              {copiedId === article.id
                                ? <Check size={16} className="text-green-600" />
                                : <Link2 size={16} />}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => navigate({ to: "/management-portal/dashboard/articles/$articleId", params: { articleId: String(article.id) } })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          disabled={deletingId === article.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          {deletingId === article.id
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-between bg-gray-50 rounded-b-xl">
            <p className="text-sm text-gray-500">
              Showing {filtered.length} of {articles.length} articles
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
