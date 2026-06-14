import { useState } from "react";
import { Facebook, Linkedin, Link2, Mail, Check, Twitter } from "lucide-react";

function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

interface ShareButtonsProps {
  url: string;
  title: string;
  layout?: "vertical" | "horizontal";
}

export function ShareButtons({ url, title, layout = "vertical" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;

  const platforms = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(title + "\n" + url)}`,
      Icon: WhatsAppIcon,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      Icon: Facebook,
    },
    {
      label: "X (Twitter)",
      href: `https://x.com/intent/tweet?url=${enc(url)}&text=${enc(title)}&via=CinescopeGlobal`,
      Icon: Twitter,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      Icon: Linkedin,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`,
      Icon: TelegramIcon,
    },
    {
      label: "Email",
      href: `mailto:?subject=${enc(title)}&body=${enc("Read this article from Cinescope Global Concept:\n\n" + url)}`,
      Icon: Mail,
    },
  ];

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const btnClass =
    "size-10 grid place-items-center border border-rule hover:bg-ink hover:text-background hover:border-ink transition-all";

  return (
    <div className={layout === "vertical" ? "flex flex-col gap-3" : "flex flex-wrap gap-2"}>
      {platforms.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClass}
          aria-label={`Share on ${label}`}
          title={`Share on ${label}`}
        >
          <Icon size={15} />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        className={btnClass}
        aria-label={copied ? "Link copied!" : "Copy link"}
        title={copied ? "Copied!" : "Copy link"}
      >
        {copied ? <Check size={15} className="text-green-500" /> : <Link2 size={15} />}
      </button>
    </div>
  );
}

interface MobileShareBarProps {
  url: string;
  title: string;
}

export function MobileShareBar({ url, title }: MobileShareBarProps) {
  const [expanded, setExpanded] = useState(false);

  function handleNativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      setExpanded(true);
    }
  }

  if (expanded) {
    return (
      <div className="flex lg:hidden items-center gap-3 py-4 border-y border-rule">
        <span className="eyebrow text-ink-muted text-xs whitespace-nowrap">Share:</span>
        <ShareButtons url={url} title={title} layout="horizontal" />
      </div>
    );
  }

  return (
    <div className="flex lg:hidden items-center gap-3 py-4 border-y border-rule">
      <span className="eyebrow text-ink-muted text-xs whitespace-nowrap">Share:</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2 border border-rule text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-background hover:border-ink transition-all"
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share Article
        </button>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="px-3 py-2 border border-rule text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-background hover:border-ink transition-all"
        >
          More
        </button>
      </div>
    </div>
  );
}
