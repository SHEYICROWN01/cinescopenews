import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";

const STORAGE_KEY = "cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch (e) {}
  }, []);

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch (e) {}
    setVisible(false);
  }

  function decline() {
    try { localStorage.setItem(STORAGE_KEY, "declined"); } catch (e) {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-rule bg-background/97 backdrop-blur-md shadow-elevated animate-[slide-down_0.4s_var(--ease-out-expo)_both] [animation-direction:reverse] [animation-fill-mode:backwards]"
      style={{ animationName: "fade-in", animationDuration: "0.4s", animationDelay: "1s", animationFillMode: "both" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-ink-muted flex-1 leading-relaxed">
          We use cookies to improve your experience and serve personalised ads. By continuing, you agree to our{" "}
          <Link to="/privacy" className="text-ink underline underline-offset-2 hover:text-brand transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={decline}
            className="eyebrow text-ink-muted hover:text-ink transition-colors px-4 py-2"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="eyebrow bg-ink text-background px-5 py-2 hover:bg-brand transition-colors"
          >
            Accept all
          </button>
          <button
            onClick={decline}
            aria-label="Close"
            className="p-1.5 text-ink-muted hover:text-ink transition-colors ml-1"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
