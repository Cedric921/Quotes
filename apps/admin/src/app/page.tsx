import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";
import { getMessages, type Locale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Focus — Des citations qui vous ressemblent",
  description:
    "Focus vous envoie chaque jour des citations choisies selon vos objectifs : rappels, widgets, écran verrouillé, fonds d'écran.",
  openGraph: {
    title: "Focus — Des citations qui vous ressemblent",
    description:
      "Des pensées choisies pour vos objectifs, sur votre écran d'accueil et en notification.",
    images: ["/landing/feed.jpg"],
  },
};

/**
 * The public front door. The admin lives under /login and /dashboard; the
 * root used to redirect there, which made the site's only public address
 * a login form.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale: Locale = lang === "en" ? "en" : "fr";
  return <Landing locale={locale} t={getMessages(locale).landing} />;
}
