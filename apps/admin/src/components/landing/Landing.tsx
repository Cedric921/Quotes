import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Check,
  Flame,
  Image as ImageIcon,
  LayoutGrid,
  Lock,
  Sparkles,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { APP_STORE_URL, CONTACT_EMAIL, PLAY_STORE_URL } from "@/lib/links";
import "./landing.css";

type Landing = {
  nav: Record<"features" | "how" | "premium" | "download" | "admin", string>;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    secondary: string;
    appstore: string;
    play: string;
    stats: string[][];
  };
  features: { title: string; subtitle: string; items: string[][] };
  how: { title: string; steps: string[][] };
  premium: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: string[];
    cta: string;
    note: string;
  };
  footer: Record<
    "tagline" | "terms" | "privacy" | "contact" | "admin" | "rights",
    string
  >;
};

const FEATURE_ICONS = [Sparkles, Bell, LayoutGrid, Lock, ImageIcon, Flame];

function Mark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={size}
      height={size}
      priority
      className="rounded-full"
    />
  );
}

function StoreButton({
  href,
  label,
  kind,
}: {
  href: string;
  label: string;
  kind: "apple" | "play";
}) {
  return (
    <a href={href} className="pill pill-ghost" aria-label={label}>
      {kind === "apple" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.2 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.9-1.1-2.9-4.9zM14 5.2c.7-.8 1.2-2 1-3.2-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.5 2.9-1.3z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M3.6 2.3 13.3 12l-9.7 9.7c-.3-.2-.5-.6-.5-1V3.3c0-.4.2-.8.5-1zm11 11 2.7 2.7-9.9 5.7 7.2-8.4zM17.3 9l3.1 1.8c.9.5.9 1.9 0 2.4L17.3 15l-3-3 3-3zm-2.7-1L7.4 2.3 17.3 8l-2.7 0z" />
        </svg>
      )}
      <span>{label}</span>
    </a>
  );
}

/**
 * The public page for the app.
 *
 * It borrows the app's own surfaces — ink for the hero, brushed silver for
 * the rest, graphite and gradient pills — so someone who has seen the app
 * recognises it, and someone who has not sees what they would get. The
 * phones are real captures, not mock-ups.
 */
export function Landing({ locale, t }: { locale: Locale; t: Landing }) {
  const legal = (page: "terms" | "privacy") => `/${page}?lang=${locale}`;
  const other = locale === "fr" ? "en" : "fr";

  return (
    <div className="landing min-h-screen">
      {/* ---------------------------------------------------------- nav */}
      <header className="hero">
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white">
              <Mark size={22} />
            </span>
            <span className="text-lg">Focus</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-white/75 md:flex">
            <a href="#features" className="hover:text-white">{t.nav.features}</a>
            <a href="#how" className="hover:text-white">{t.nav.how}</a>
            <a href="#premium" className="hover:text-white">{t.nav.premium}</a>
            <Link href={`/?lang=${other}`} className="uppercase tracking-wider hover:text-white">
              {other}
            </Link>
          </div>
          <a href="#download" className="pill pill-ghost !h-10 !px-4 text-sm">
            {t.nav.download}
          </a>
        </nav>

        {/* --------------------------------------------------------- hero */}
        <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-10 md:grid-cols-[1.05fr_1fr] md:pb-32 md:pt-16">
          <div>
            <p className="rise mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/85">
              <Sparkles size={14} /> {t.hero.eyebrow}
            </p>
            <h1 className="rise rise-2 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              {t.hero.title}
            </h1>
            <p className="rise rise-3 mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              {t.hero.subtitle}
            </p>
            <div className="rise rise-4 mt-8 flex flex-wrap gap-3">
              <a href="#download" className="pill pill-accent">{t.hero.cta}</a>
              <a href="#features" className="pill border border-white/20 bg-white/10 text-white backdrop-blur">
                {t.hero.secondary}
              </a>
            </div>
            <dl className="rise rise-4 mt-12 grid max-w-md grid-cols-3 gap-4">
              {t.hero.stats.map(([value, label]) => (
                <div key={label}>
                  <dt className="accent-text text-3xl font-bold">{value}</dt>
                  <dd className="mt-1 text-sm text-white/65">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto flex h-[520px] w-full max-w-[520px] items-end justify-center md:h-[600px]">
            <div className="phone float absolute bottom-6 left-0 hidden md:block" style={{ "--tilt": "-8deg", animationDelay: "-1.5s" } as React.CSSProperties}>
              <Image src="/landing/profile.jpg" alt="" width={660} height={1434} />
            </div>
            <div className="phone float relative z-10 !w-[260px]" style={{ "--tilt": "0deg" } as React.CSSProperties}>
              <Image src="/landing/feed.jpg" alt="" width={660} height={1434} priority />
            </div>
            <div className="phone float absolute bottom-6 right-0 hidden md:block" style={{ "--tilt": "8deg", animationDelay: "-3s" } as React.CSSProperties}>
              <Image src="/landing/paywall.jpg" alt="" width={660} height={1434} />
            </div>
          </div>
        </section>
      </header>

      {/* ------------------------------------------------------- features */}
      <section id="features" className="metal scroll-mt-20 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.features.title}</h2>
          <p className="mt-3 max-w-2xl text-lg" style={{ color: "var(--ink-300)" }}>
            {t.features.subtitle}
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.items.map(([title, body], i) => {
              const Icon = FEATURE_ICONS[i] ?? Sparkles;
              return (
                <article key={title} className="card p-6">
                  <div className="icon-tile"><Icon size={22} /></div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 leading-relaxed" style={{ color: "var(--ink-300)" }}>{body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ how */}
      <section id="how" className="scroll-mt-20 py-24" style={{ background: "var(--silver-50)" }}>
        <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.how.title}</h2>
            <ol className="mt-10 flex gap-5">
              <li className="rail shrink-0" aria-hidden />
              <div className="space-y-8">
                {t.how.steps.map(([title, body], i) => (
                  <div key={title} className="flex gap-4">
                    <span className="step-index shrink-0">{i + 1}</span>
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="mt-1 leading-relaxed" style={{ color: "var(--ink-300)" }}>{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ol>
          </div>
          <div className="card metal flex items-center justify-center p-8 md:p-12">
            <div className="phone !w-[240px]" style={{ boxShadow: "0 24px 48px rgba(21,28,39,0.25)" }}>
              <Image src="/landing/profile.jpg" alt="" width={660} height={1434} />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- premium */}
      <section id="premium" className="hero scroll-mt-20 py-24">
        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2 md:items-center">
          <div>
            <p className="accent-text text-sm font-semibold uppercase tracking-widest">{t.premium.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{t.premium.title}</h2>
            <p className="mt-4 text-lg text-white/75">{t.premium.subtitle}</p>
            <ul className="mt-8 space-y-3">
              {t.premium.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: "var(--accent)" }}>
                    <Check size={14} color="#151c27" strokeWidth={3} />
                  </span>
                  <span className="text-white/90">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <a href="#download" className="pill pill-accent">{t.premium.cta}</a>
              <p className="mt-3 text-sm text-white/55">{t.premium.note}</p>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="phone" style={{ "--tilt": "4deg", transform: "rotate(4deg)" } as React.CSSProperties}>
              <Image src="/landing/paywall.jpg" alt="" width={660} height={1434} />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- download */}
      <section id="download" className="metal scroll-mt-20 py-24">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-white shadow-lg">
            <Mark size={48} />
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">{t.hero.cta}</h2>
          <p className="mt-3 text-lg" style={{ color: "var(--ink-300)" }}>{t.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <StoreButton href={APP_STORE_URL} label={t.hero.appstore} kind="apple" />
            <StoreButton href={PLAY_STORE_URL} label={t.hero.play} kind="play" />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- footer */}
      <footer className="border-t" style={{ borderColor: "var(--silver-300)", background: "var(--silver-50)" }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Mark size={28} />
            <div className="text-sm" style={{ color: "var(--ink-300)" }}>
              <p className="font-medium" style={{ color: "var(--ink-900)" }}>Focus</p>
              <p>{t.footer.tagline}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: "var(--ink-300)" }}>
            <Link href={legal("terms")} className="hover:underline">{t.footer.terms}</Link>
            <Link href={legal("privacy")} className="hover:underline">{t.footer.privacy}</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline">{t.footer.contact}</a>
            <Link href="/login" className="hover:underline">{t.footer.admin}</Link>
          </nav>
        </div>
        <p className="pb-8 text-center text-xs" style={{ color: "var(--ink-300)" }}>
          © {new Date().getFullYear()} ODERA Formations. {t.footer.rights}
        </p>
      </footer>
    </div>
  );
}
