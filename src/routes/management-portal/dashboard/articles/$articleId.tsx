import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import {
  ArrowLeft, Save, Send, Eye, EyeOff, X, Plus, Trash2,
  Bold, Italic, Underline, Link2, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Maximize2,
  ImagePlus, Quote, Heading2, Heading3, Minus,
  ChevronUp, ChevronDown, Globe, Zap, Upload, Loader2, Type, ArrowRight,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { getArticleById, updateArticle, getArticles } from "../../../../fns/articles";
import { getCategories } from "../../../../fns/categories";
import type { Category } from "../../../../db/schema";

export const Route = createFileRoute("/management-portal/dashboard/articles/$articleId")({
  loader: async ({ params }) => {
    const id = Number(params.articleId);
    if (isNaN(id)) throw notFound();
    const [article, cats, allArticles] = await Promise.all([getArticleById({ data: id }), getCategories(), getArticles()]);
    if (!article) throw notFound();
    return { article, categories: cats, allArticles };
  },
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Article not found</h2>
    </div>
  ),
  component: EditArticlePage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type ImageAlignment = "left" | "center" | "right" | "full";
interface ParagraphBlock { id: string; type: "paragraph"; html: string }
interface HeadingBlock   { id: string; type: "heading"; level: 2 | 3; text: string }
interface ImageBlock     { id: string; type: "image"; url: string; caption: string; alt: string; alignment: ImageAlignment }
interface PullquoteBlock { id: string; type: "pullquote"; text: string; attribution: string }
interface DividerBlock   { id: string; type: "divider" }
type Block = ParagraphBlock | HeadingBlock | ImageBlock | PullquoteBlock | DividerBlock;

function uid() { return Math.random().toString(36).slice(2, 10); }

// ─── Convert file to base64 (persists across sessions) ───────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Parse saved HTML back into blocks ───────────────────────────────────────

function parseHtmlToBlocks(html: string): Block[] {
  if (!html?.trim()) return [{ id: uid(), type: "paragraph", html: "" }];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const blocks: Block[] = [];

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) blocks.push({ id: uid(), type: "paragraph", html: text });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === "h2") {
      blocks.push({ id: uid(), type: "heading", level: 2, text: el.textContent ?? "" });
    } else if (tag === "h3") {
      blocks.push({ id: uid(), type: "heading", level: 3, text: el.textContent ?? "" });
    } else if (tag === "figure") {
      const img = el.querySelector("img");
      const caption = el.querySelector("figcaption")?.textContent ?? "";
      blocks.push({
        id: uid(), type: "image",
        url: img?.src ?? "",
        alt: img?.alt ?? "",
        caption,
        alignment: (img?.getAttribute("data-align") ?? "center") as ImageAlignment,
      });
    } else if (tag === "blockquote") {
      const clone = el.cloneNode(true) as Element;
      const cite = clone.querySelector("cite");
      const attribution = cite?.textContent ?? "";
      cite?.remove();
      blocks.push({ id: uid(), type: "pullquote", text: clone.textContent?.trim() ?? "", attribution });
    } else if (tag === "hr") {
      blocks.push({ id: uid(), type: "divider" });
    } else {
      blocks.push({ id: uid(), type: "paragraph", html: el.outerHTML });
    }
  });

  return blocks.length > 0 ? blocks : [{ id: uid(), type: "paragraph", html: "" }];
}

// ─── Serialize blocks back to HTML for saving ─────────────────────────────────

function blocksToHtml(blocks: Block[]): string {
  return blocks.map((b) => {
    if (b.type === "paragraph")  return (b as ParagraphBlock).html || "";
    if (b.type === "heading")    return `<h${(b as HeadingBlock).level}>${(b as HeadingBlock).text}</h${(b as HeadingBlock).level}>`;
    if (b.type === "pullquote")  return `<blockquote>${(b as PullquoteBlock).text}${(b as PullquoteBlock).attribution ? `<cite>${(b as PullquoteBlock).attribution}</cite>` : ""}</blockquote>`;
    if (b.type === "image")      return `<figure><img src="${(b as ImageBlock).url}" alt="${(b as ImageBlock).alt}" data-align="${(b as ImageBlock).alignment}" />${(b as ImageBlock).caption ? `<figcaption>${(b as ImageBlock).caption}</figcaption>` : ""}</figure>`;
    if (b.type === "divider")    return `<hr />`;
    return "";
  }).filter(Boolean).join("\n");
}

// ─── Featured Image ───────────────────────────────────────────────────────────

function FeaturedImageSection({
  url, onUrl, caption, onCaption,
}: {
  url: string; onUrl: (u: string) => void;
  caption: string; onCaption: (c: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    const b64 = await fileToBase64(file);
    onUrl(b64);
    setLoading(false);
  };

  return (
    <div className="mb-6">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Featured Image</label>
      {url ? (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <div className="relative group">
            <img src={url} alt="" className="w-full h-56 object-cover" onError={() => onUrl("")} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-100">
                <Upload size={15} /> Replace
              </button>
              <button type="button" onClick={() => onUrl("")}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-red-600">
                <X size={15} /> Remove
              </button>
            </div>
          </div>
          <input
            type="text"
            value={caption}
            onChange={(e) => onCaption(e.target.value)}
            placeholder="Photo caption / credit (e.g. Photo: AP / Getty Images)…"
            className="w-full border-t border-gray-200 px-4 py-2 text-sm text-gray-600 outline-none focus:bg-gray-50"
          />
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={async (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) await handleFile(f); }}
          onClick={() => fileRef.current?.click()}
          className={`h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragging ? "border-brand bg-brand/5" : "border-gray-300 bg-gray-50 hover:border-brand hover:bg-brand/5"
          }`}
        >
          {loading ? <Loader2 size={24} className="text-brand animate-spin mb-2" /> : <ImagePlus size={24} className="text-gray-400 mb-2" />}
          <p className="text-sm font-medium text-gray-500">{loading ? "Uploading…" : "Drop or click to upload featured image"}</p>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleFile(f); }} />
    </div>
  );
}

// ─── Image Block ──────────────────────────────────────────────────────────────

const alignments: ImageAlignment[] = ["left", "center", "right", "full"];
const alignLabel: Record<ImageAlignment, string> = { left: "Float Left", center: "Center", right: "Float Right", full: "Full Width" };
const AlignIcon: Record<ImageAlignment, React.ReactNode> = {
  left: <AlignLeft size={13} />, center: <AlignCenter size={13} />,
  right: <AlignRight size={13} />, full: <Maximize2 size={13} />,
};
function alignClass(a: ImageAlignment) {
  if (a === "left")  return "float-left mr-6 mb-4 w-1/2 max-w-sm";
  if (a === "right") return "float-right ml-6 mb-4 w-1/2 max-w-sm";
  if (a === "full")  return "w-full";
  return "mx-auto max-w-xl";
}

function ImageBlockView({ block, onChange, onRemove }: {
  block: ImageBlock; onChange: (b: ImageBlock) => void; onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    const b64 = await fileToBase64(file);
    onChange({ ...block, url: b64 });
    setLoading(false);
  };

  return (
    <div className={`relative group ${block.alignment === "full" ? "" : "clearfix"}`}>
      <div className={`${alignClass(block.alignment)} rounded-lg overflow-hidden border border-gray-200`}>
        {block.url ? (
          <div className="relative">
            <img src={block.url} alt={block.alt} className="w-full object-cover max-h-96" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="bg-white/90 text-gray-700 rounded p-1.5 shadow text-xs hover:bg-white"><Upload size={13} /></button>
              <button type="button" onClick={onRemove}
                className="bg-red-500/90 text-white rounded p-1.5 shadow hover:bg-red-600"><X size={13} /></button>
            </div>
          </div>
        ) : (
          <div onClick={() => fileRef.current?.click()}
            className="h-40 bg-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
            {loading ? <Loader2 size={24} className="text-brand animate-spin mb-1" /> : <ImagePlus size={28} className="text-gray-400 mb-1" />}
            <span className="text-xs text-gray-500">{loading ? "Uploading…" : "Click to upload image"}</span>
          </div>
        )}
        <input type="text" value={block.caption}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          placeholder="Caption (optional)..."
          className="w-full px-3 py-2 text-sm text-gray-600 italic border-t border-gray-200 bg-gray-50 outline-none focus:bg-white" />
      </div>
      <div className="flex items-center gap-1 mt-2 flex-wrap">
        <span className="text-xs text-gray-400 mr-1">Align:</span>
        {alignments.map((a) => (
          <button key={a} type="button" title={alignLabel[a]} onClick={() => onChange({ ...block, alignment: a })}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              block.alignment === a ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {AlignIcon[a]} {alignLabel[a]}
          </button>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleFile(f); }} />
    </div>
  );
}

// ─── Pullquote Block ──────────────────────────────────────────────────────────

function PullquoteBlockView({ block, onChange, onRemove }: {
  block: PullquoteBlock; onChange: (b: PullquoteBlock) => void; onRemove: () => void;
}) {
  return (
    <div className="relative group">
      <div className="border-l-4 border-brand pl-6 py-2">
        <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Pull quote text..." rows={3}
          className="w-full text-2xl font-serif italic text-gray-800 resize-none outline-none bg-transparent leading-relaxed" />
        <input type="text" value={block.attribution}
          onChange={(e) => onChange({ ...block, attribution: e.target.value })}
          placeholder="— Attribution (optional)"
          className="w-full text-sm text-gray-500 outline-none bg-transparent mt-1" />
      </div>
      <button type="button" onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <X size={12} />
      </button>
    </div>
  );
}

// ─── Block Wrapper ────────────────────────────────────────────────────────────

function BlockWrapper({ children, onMoveUp, onMoveDown, onDelete, isFirst, isLast }: {
  children: React.ReactNode; onMoveUp: () => void; onMoveDown: () => void;
  onDelete: () => void; isFirst: boolean; isLast: boolean;
}) {
  return (
    <div className="relative group/block">
      <div className="absolute -left-10 top-1 flex flex-col gap-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity">
        <button type="button" onClick={onMoveUp} disabled={isFirst}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-400"><ChevronUp size={14} /></button>
        <button type="button" onClick={onMoveDown} disabled={isLast}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-400"><ChevronDown size={14} /></button>
        <button type="button" onClick={onDelete}
          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
      </div>
      {children}
    </div>
  );
}

// ─── Add Block Menu ───────────────────────────────────────────────────────────

function AddBlockMenu({ onAdd, onClose }: {
  onAdd: (type: Block["type"], extra?: Partial<Block>) => void; onClose: () => void;
}) {
  const options = [
    { type: "paragraph" as const,  icon: <Type size={16} />,      label: "Paragraph",  desc: "Text paragraph" },
    { type: "heading" as const,    icon: <Heading2 size={16} />,   label: "Heading 2",  desc: "Section heading" },
    { type: "heading" as const,    icon: <Heading3 size={16} />,   label: "Heading 3",  desc: "Sub-heading", extra: { level: 3 as const } },
    { type: "image" as const,      icon: <ImagePlus size={16} />,  label: "Image",      desc: "Photo with alignment" },
    { type: "pullquote" as const,  icon: <Quote size={16} />,      label: "Pull Quote", desc: "Highlighted quote" },
    { type: "divider" as const,    icon: <Minus size={16} />,      label: "Divider",    desc: "Horizontal rule" },
  ];
  return (
    <div className="relative">
      <div className="absolute z-20 top-2 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-2 w-64">
        <div className="flex items-center justify-between px-2 py-1 mb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add Block</span>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
        </div>
        {options.map((o, i) => (
          <button key={i} type="button"
            onClick={() => { onAdd(o.type, (o as any).extra); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 flex-shrink-0">{o.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">{o.label}</p>
              <p className="text-xs text-gray-400">{o.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Tags Input ───────────────────────────────────────────────────────────────

function TagsInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 bg-brand/10 text-brand text-xs font-medium px-2.5 py-1 rounded-full">
            {tag}<button type="button" onClick={() => onChange(tags.filter(t => t !== tag))}><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder="Add tag, press Enter..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
        <button type="button" onClick={add}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700">Add</button>
      </div>
    </div>
  );
}

// ─── Read Also Selector ───────────────────────────────────────────────────────

type ArticleListItem = { id: number; title: string; slug: string; status: string };

function ReadAlsoSelector({
  selected, onChange, articles: allArticles,
}: {
  selected: number[];
  onChange: (ids: number[]) => void;
  articles: ArticleListItem[];
}) {
  const [query, setQuery] = useState("");

  const filtered = allArticles.filter(
    (a) => a.title.toLowerCase().includes(query.toLowerCase()) && !selected.includes(a.id)
  ).slice(0, 6);

  const selectedArticles = allArticles.filter((a) => selected.includes(a.id));

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <Link2 size={13} className="text-brand flex-shrink-0" />
        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
          Read Also — Reference Links
        </span>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          Link readers to related articles. Selected articles will appear as a{" "}
          <strong className="text-gray-700">"Read Also"</strong> block on the published page.
        </p>

        {/* Selected articles */}
        {selectedArticles.map((a) => (
          <div key={a.id} className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
            <ArrowRight size={13} className="text-brand flex-shrink-0" />
            <p className="flex-1 text-sm font-medium text-gray-800 leading-snug line-clamp-2 min-w-0">{a.title}</p>
            <button
              type="button"
              onClick={() => onChange(selected.filter((id) => id !== a.id))}
              className="text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        ))}

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles to reference..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
          />
          {query.trim() && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-lg bg-white">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-400 px-3 py-2.5">No articles found</p>
              ) : (
                filtered.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => { onChange([...selected, a.id]); setQuery(""); }}
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-red-50 border-b border-gray-100 last:border-0 flex items-center gap-2 transition-colors"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.status === "published" ? "bg-green-400" : "bg-yellow-400"}`} />
                    <span className="truncate text-gray-800 font-medium">{a.title}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400">Search and select published articles to reference</p>
      </div>
    </div>
  );
}

// ─── Sidebar Card ─────────────────────────────────────────────────────────────

function SidebarCard({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{title}</span>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label, description }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="w-full flex items-center justify-between">
      <div className="text-left">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-brand" : "bg-gray-200"}`}>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </div>
    </button>
  );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({ title, subtitle, featuredImage, content, author, categoryName, onClose }: {
  title: string; subtitle: string; featuredImage: string;
  content: string; author: string; categoryName: string; onClose: () => void;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Preview</span>
          <span className="text-sm text-gray-600">This is how your article will look when published</span>
        </div>
        <button type="button" onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700">
          <EyeOff size={16} /> Close Preview
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {categoryName && <p className="text-xs font-bold text-brand uppercase tracking-widest mb-4">{categoryName}</p>}
          <h1 className="text-4xl lg:text-5xl font-black text-gray-950 leading-tight mb-4">{title || <span className="text-gray-300">No title</span>}</h1>
          {subtitle && <p className="text-xl text-gray-500 leading-relaxed mb-6">{subtitle}</p>}
          {author && (
            <div className="flex items-center gap-3 pb-6 mb-6 border-b-2 border-gray-900">
              <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm">
                {author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{author}</p>
                <p className="text-xs text-gray-400">{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>
          )}
          {featuredImage && <img src={featuredImage} alt={title} className="w-full rounded-xl mb-8 object-cover max-h-96" />}
          <div
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed
              [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3
              [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
              [&_p]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:pl-6
              [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-6
              [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
              [&_figure]:my-6 [&_figure_img]:w-full [&_figure_img]:rounded-lg
              [&_figcaption]:text-sm [&_figcaption]:text-gray-400 [&_figcaption]:italic [&_figcaption]:mt-2
              [&_hr]:border-gray-200 [&_hr]:my-8 [&_a]:text-brand [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: content || "<p class='text-gray-400'>No content yet.</p>" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Edit Page ────────────────────────────────────────────────────────────────

function EditArticlePage() {
  const navigate = useNavigate();
  const { article, categories, allArticles } = Route.useLoaderData() as { article: any; categories: Category[]; allArticles: ArticleListItem[] };

  // Parse saved HTML into blocks on load
  const [blocks, setBlocks] = useState<Block[]>(() => parseHtmlToBlocks(article.content ?? ""));
  const [title, setTitle]               = useState(article.title ?? "");
  const [subtitle, setSubtitle]         = useState(article.subtitle ?? "");
  const [featuredImage, setFeaturedImage] = useState(article.featuredImage ?? "");
  const [featuredImageCaption, setFeaturedImageCaption] = useState(article.featuredImageCaption ?? "");
  const [categoryId, setCategoryId]     = useState<number | "">(article.categoryId ?? "");
  const [author, setAuthor]             = useState(article.author ?? "");
  const [isBreaking, setIsBreaking]     = useState(!!article.isBreaking);
  const [isFeatured, setIsFeatured]     = useState(!!article.isFeatured);
  const [allowComments, setAllowComments] = useState(true);
  const [tags, setTags]                 = useState<string[]>(
    article.tags ? (article.tags as string).split(",").filter(Boolean) : []
  );
  const [seoTitle, setSeoTitle]         = useState(article.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(article.seoDescription ?? "");
  const [readAlso, setReadAlso]         = useState<number[]>(
    article.readAlso ? (article.readAlso as string).split(",").map(Number).filter(Boolean) : []
  );
  const [saving, setSaving]             = useState(false);
  const [showPreview, setShowPreview]   = useState(false);
  const [showAddMenu, setShowAddMenu]   = useState<number | null>(null);

  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const execFormat = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
  }, []);

  const selectedCategory = categories.find(c => c.id === categoryId);

  // Block operations
  const addBlock = useCallback((afterIndex: number, type: Block["type"], extra?: Partial<Block>) => {
    const newBlock: Block = (() => {
      switch (type) {
        case "image":     return { id: uid(), type: "image", url: "", caption: "", alt: "", alignment: "center" };
        case "heading":   return { id: uid(), type: "heading", level: (extra as any)?.level ?? 2, text: "" };
        case "pullquote": return { id: uid(), type: "pullquote", text: "", attribution: "" };
        case "divider":   return { id: uid(), type: "divider" };
        default:          return { id: uid(), type: "paragraph", html: "" };
      }
    })();
    setBlocks(prev => { const next = [...prev]; next.splice(afterIndex + 1, 0, newBlock); return next; });
  }, []);

  const updateBlock = useCallback(<T extends Block>(id: string, updates: Partial<T>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.length > 1 ? prev.filter(b => b.id !== id) : prev);
  }, []);

  const moveBlock = useCallback((index: number, direction: -1 | 1) => {
    setBlocks(prev => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  // Sync block refs html on mount (for contentEditable blocks restored from DB)
  useEffect(() => {
    blocks.forEach(b => {
      if (b.type === "paragraph" && blockRefs.current[b.id]) {
        const el = blockRefs.current[b.id]!;
        if (el.innerHTML !== (b as ParagraphBlock).html) {
          el.innerHTML = (b as ParagraphBlock).html;
        }
      }
    });
  }, []); // only on mount

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) { alert("Please enter a headline."); return; }
    setSaving(true);
    try {
      await updateArticle({
        data: {
          id:             article.id,
          title:          title.trim(),
          subtitle:       subtitle.trim(),
          content:        blocksToHtml(blocks),
          featuredImage,
          featuredImageCaption: featuredImageCaption.trim(),
          categoryId:     categoryId !== "" ? Number(categoryId) : null,
          author:         author.trim(),
          status:         publish ? "published" : "draft",
          isBreaking,
          isFeatured,
          tags:           tags.join(","),
          seoTitle:       seoTitle.trim() || title.trim(),
          seoDescription: seoDescription.trim(),
          readAlso:       readAlso.join(","),
        },
      });
      navigate({ to: "/management-portal/dashboard/articles" });
    } catch (err: any) {
      alert(err.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isPublished = article.status === "published";
  const previewContent = blocksToHtml(blocks);

  return (
    <>
      {showPreview && (
        <PreviewModal
          title={title} subtitle={subtitle} featuredImage={featuredImage}
          content={previewContent} author={author}
          categoryName={selectedCategory?.name ?? ""}
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className="min-h-screen bg-gray-50 -m-6 lg:-m-8">
        {/* Top bar */}
        <div className="sticky top-16 z-30 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate({ to: "/management-portal/dashboard/articles" })}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><ArrowLeft size={18} /></button>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Editing Article</p>
              <p className="text-sm font-bold text-gray-800 leading-none mt-0.5 max-w-sm truncate">{title || "Untitled"}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowPreview(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Eye size={16} /> Preview
            </button>
            {isPublished && article.slug && (
              <a
                href={`https://www.cinescopeglobal.com/article/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="View published article on the website"
              >
                <Globe size={16} /> View on Site
              </a>
            )}
            <button type="button" onClick={() => handleSave(false)} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Draft
            </button>
            <button type="button" onClick={() => handleSave(true)} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-brand hover:bg-brand/90 rounded-lg transition-colors shadow-sm disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {isPublished ? "Update" : "Publish"}
            </button>
          </div>
        </div>

        <div className="flex items-start">
          {/* ── Left: Editor ── */}
          <div className="flex-1 min-w-0 px-6 lg:px-12 py-8 max-w-4xl mx-auto">
            <FeaturedImageSection
              url={featuredImage}
              onUrl={setFeaturedImage}
              caption={featuredImageCaption}
              onCaption={setFeaturedImageCaption}
            />

            {selectedCategory && (
              <p className="text-xs font-bold text-brand uppercase tracking-widest mb-3">{selectedCategory.name}</p>
            )}

            <textarea value={title}
              onChange={(e) => { setTitle(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
              placeholder="Article headline..." rows={2}
              className="w-full resize-none bg-transparent text-4xl lg:text-5xl font-black text-gray-950 leading-tight placeholder:text-gray-300 outline-none mb-4 overflow-hidden"
              style={{ lineHeight: 1.15 }}
            />
            <textarea value={subtitle}
              onChange={(e) => { setSubtitle(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
              placeholder="Sub-headline or lead paragraph..." rows={2}
              className="w-full resize-none bg-transparent text-xl text-gray-500 leading-relaxed placeholder:text-gray-300 outline-none mb-6 overflow-hidden"
            />

            <div className="flex items-center gap-4 pb-6 mb-6 border-b-2 border-gray-900">
              <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {author ? author.charAt(0).toUpperCase() : "?"}
              </div>
              <div>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                  className="block font-semibold text-gray-800 text-sm outline-none bg-transparent placeholder:text-gray-300" />
                <p className="text-xs text-gray-400 mt-0.5">
                  {article.publishedAt
                    ? `Published ${new Date(article.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
                    : `Draft · created ${new Date(article.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
                </p>
              </div>
              {isBreaking && (
                <span className="ml-auto flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  <Zap size={10} /> Breaking
                </span>
              )}
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-0.5 flex-wrap border border-gray-200 rounded-lg bg-white px-2 py-1.5 shadow-sm mb-4">
              <button type="button" title="Bold"      onClick={() => execFormat("bold")}      className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><Bold size={15} /></button>
              <button type="button" title="Italic"    onClick={() => execFormat("italic")}    className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><Italic size={15} /></button>
              <button type="button" title="Underline" onClick={() => execFormat("underline")} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><Underline size={15} /></button>
              <span className="w-px h-5 bg-gray-200 mx-0.5" />
              <button type="button" title="H2" onClick={() => execFormat("formatBlock", "h2")} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><Heading2 size={15} /></button>
              <button type="button" title="H3" onClick={() => execFormat("formatBlock", "h3")} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><Heading3 size={15} /></button>
              <span className="w-px h-5 bg-gray-200 mx-0.5" />
              <button type="button" title="Bullet list"   onClick={() => execFormat("insertUnorderedList")} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><List size={15} /></button>
              <button type="button" title="Numbered list" onClick={() => execFormat("insertOrderedList")}   className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><ListOrdered size={15} /></button>
              <span className="w-px h-5 bg-gray-200 mx-0.5" />
              <button type="button" title="Link" onClick={() => { const url = prompt("URL:"); if (url) execFormat("createLink", url); }}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><Link2 size={15} /></button>
              <button type="button" title="Quote" onClick={() => execFormat("formatBlock", "blockquote")}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><Quote size={15} /></button>
              <button type="button" title="Remove formatting" onClick={() => execFormat("removeFormat")}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-400 ml-auto"><Type size={15} /></button>
            </div>

            {/* Content Blocks */}
            <div className="space-y-4 pl-10 relative">
              {blocks.map((block, index) => (
                <div key={block.id}>
                  <BlockWrapper
                    onMoveUp={() => moveBlock(index, -1)} onMoveDown={() => moveBlock(index, 1)}
                    onDelete={() => deleteBlock(block.id)} isFirst={index === 0} isLast={index === blocks.length - 1}
                  >
                    {block.type === "paragraph" && (
                      <div
                        ref={(el) => { blockRefs.current[block.id] = el; }}
                        contentEditable suppressContentEditableWarning
                        onInput={(e) => updateBlock<ParagraphBlock>(block.id, { html: (e.target as HTMLDivElement).innerHTML })}
                        className="min-h-[3rem] text-gray-800 text-lg leading-relaxed outline-none
                          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none
                          [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2
                          [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2
                          [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600
                          [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6
                          [&_a]:text-brand [&_a]:underline [&_p]:mb-2"
                        data-placeholder={index === 0 ? "Start writing your article…" : "Continue writing…"}
                      />
                    )}
                    {block.type === "heading" && (
                      <input type="text" value={(block as HeadingBlock).text}
                        onChange={(e) => updateBlock<HeadingBlock>(block.id, { text: e.target.value })}
                        placeholder={block.level === 2 ? "Section heading…" : "Sub-heading…"}
                        className={`w-full bg-transparent outline-none font-bold text-gray-900 placeholder:text-gray-300 ${block.level === 2 ? "text-3xl" : "text-2xl"}`}
                      />
                    )}
                    {block.type === "image" && (
                      <ImageBlockView block={block as ImageBlock}
                        onChange={(b) => updateBlock<ImageBlock>(block.id, b)}
                        onRemove={() => deleteBlock(block.id)} />
                    )}
                    {block.type === "pullquote" && (
                      <PullquoteBlockView block={block as PullquoteBlock}
                        onChange={(b) => updateBlock<PullquoteBlock>(block.id, b)}
                        onRemove={() => deleteBlock(block.id)} />
                    )}
                    {block.type === "divider" && (
                      <div className="relative group/divider">
                        <hr className="border-gray-300" />
                        <button type="button" onClick={() => deleteBlock(block.id)}
                          className="absolute -top-2 right-0 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover/divider:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </BlockWrapper>

                  {/* Add block between */}
                  <div className="flex items-center gap-2 my-2 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <div className="flex-1 h-px bg-gray-200" />
                    <button type="button"
                      onClick={() => setShowAddMenu(showAddMenu === index ? null : index)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-gray-400 hover:text-brand hover:bg-brand/5 rounded-full border border-gray-200 hover:border-brand transition-colors">
                      <Plus size={12} /> Add Block
                    </button>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  {showAddMenu === index && (
                    <AddBlockMenu
                      onAdd={(type, extra) => { addBlock(index, type, extra); setShowAddMenu(null); }}
                      onClose={() => setShowAddMenu(null)}
                    />
                  )}
                </div>
              ))}

              <button type="button" onClick={() => setShowAddMenu(blocks.length - 1)}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl w-full text-gray-400 hover:border-brand hover:text-brand hover:bg-brand/5 transition-colors text-sm font-semibold">
                <Plus size={18} /> Add content block
              </button>
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <aside className="hidden xl:block w-80 flex-shrink-0 sticky top-32 self-start mr-6 space-y-4 py-8">
            <SidebarCard title="Publish">
              <div className="flex gap-2">
                <button type="button" onClick={() => handleSave(false)} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700 disabled:opacity-50">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Draft
                </button>
                <button type="button" onClick={() => handleSave(true)} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-brand hover:bg-brand/90 rounded-lg text-sm font-bold text-white disabled:opacity-50 shadow-sm">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {isPublished ? "Update" : "Publish"}
                </button>
              </div>
              <button type="button" onClick={() => setShowPreview(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 transition-colors">
                <Eye size={15} /> Preview Article
              </button>
            </SidebarCard>

            <SidebarCard title="Category">
              <select value={categoryId}
                onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white">
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </SidebarCard>

            <SidebarCard title="Tags">
              <TagsInput tags={tags} onChange={setTags} />
            </SidebarCard>

            <SidebarCard title="Options">
              <Toggle checked={isBreaking} onChange={setIsBreaking} label="Breaking News" description="Show urgent breaking badge" />
              <div className="border-t border-gray-100" />
              <Toggle checked={isFeatured} onChange={setIsFeatured} label="Featured Article" description="Pin to homepage featured" />
              <div className="border-t border-gray-100" />
              <Toggle checked={allowComments} onChange={setAllowComments} label="Allow Comments" />
            </SidebarCard>

            <ReadAlsoSelector
              selected={readAlso}
              onChange={setReadAlso}
              articles={allArticles.filter((a) => a.id !== article.id)}
            />

            <SidebarCard title="SEO" defaultOpen={false}>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1"><Globe size={11} /> Meta Title</label>
                <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "SEO title…"}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
                <p className="text-xs text-gray-400 mt-1">{(seoTitle || title).length}/60 chars</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Meta Description</label>
                <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Brief description for search engines…" rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none" />
                <p className="text-xs text-gray-400 mt-1">{seoDescription.length}/160 chars</p>
              </div>
            </SidebarCard>
          </aside>
        </div>
      </div>
    </>
  );
}
