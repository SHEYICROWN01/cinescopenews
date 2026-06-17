import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Cinescope Global Concept" },
      { name: "description", content: "Cinescope Global Concept's privacy policy, terms of service, and editorial standards." },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS = [
  { id: "intro", title: "Introduction", body: "Cinescope Global Concept (\"we\", \"us\") is committed to protecting the privacy of every reader. This policy explains what data we collect, how we use it, and the choices you have." },
  { id: "data", title: "Information we collect", body: "We collect information you provide directly — such as your email when you subscribe to a newsletter — and information collected automatically, including device information, IP address, pages visited, and referring URLs." },
  { id: "use", title: "How we use your information", body: "We use the information we collect to deliver and improve our services, personalise content, communicate with you, measure audience engagement, and protect against fraud and abuse." },
  { id: "cookies", title: "Cookies and similar technologies", body: "We use cookies and similar technologies for analytics, personalisation, and advertising. You can control cookies through your browser settings or our cookie preferences panel." },
  { id: "share", title: "Sharing of information", body: "We do not sell your personal data. We share information only with trusted service providers under strict confidentiality, when required by law, or to protect the rights and safety of our readers and staff." },
  { id: "rights", title: "Your rights", body: "You have the right to access, correct, delete, or export your personal data. You may also object to certain processing or withdraw consent at any time by contacting privacy@cinescopenews.com.ng." },
  { id: "security", title: "Data security", body: "We implement technical and organisational safeguards to protect your data. No method of transmission over the internet is fully secure, but we work continuously to apply industry best practice." },
  { id: "children", title: "Children's privacy", body: "Our services are not directed to children under 13. We do not knowingly collect personal data from children. If you believe we have, please contact us so we can delete it." },
  { id: "changes", title: "Changes to this policy", body: "We may update this policy from time to time. We will notify readers of material changes by posting the new policy on this page with an updated effective date." },
  { id: "contact", title: "Contact", body: "Questions about this policy can be sent to privacy@cinescopenews.com.ng or by post to our Lagos headquarters." },
];

function PrivacyPage() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="bg-ink text-background py-16 border-b border-ink">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="eyebrow text-brand mb-4">Legal</p>
          <h1 className="font-display text-4xl md:text-6xl font-black tracking-tighter">Privacy Policy</h1>
          <p className="font-serif-body text-background/65 mt-4">Effective: May 1, 2026</p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-12 gap-10 lg:gap-16">
          {/* TOC */}
          <aside className="hidden lg:block col-span-3">
            <div className="sticky top-28">
              <p className="eyebrow text-ink-muted mb-5">On this page</p>
              <ul className="space-y-2 border-l border-rule">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`block pl-5 py-2 -ml-px border-l text-sm transition-colors ${
                        active === s.id ? "border-brand text-brand font-semibold" : "border-transparent text-ink-muted hover:text-ink"
                      }`}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Content */}
          <article className="col-span-12 lg:col-span-9 max-w-[68ch] font-serif-body">
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="mb-14 scroll-mt-28">
                <h2 className="font-display text-2xl md:text-3xl font-black mb-4">{s.title}</h2>
                <p className="text-lg leading-[1.8] text-ink">{s.body}</p>
              </section>
            ))}

            <div className="mt-16 p-8 bg-surface border-l-4 border-brand">
              <p className="eyebrow text-brand mb-2">Need more detail?</p>
              <p className="text-ink leading-relaxed">
                For our full Terms of Service, Cookie Policy, and Editorial Code of Ethics, please contact our legal team at <a href="mailto:legal@cinescopenews.com.ng" className="text-brand underline">legal@cinescopenews.com.ng</a>.
              </p>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
