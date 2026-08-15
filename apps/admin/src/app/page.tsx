import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";
import { getMessages, type Locale } from "@/lib/i18n";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/links";

const TITLE = "Focus — Des citations qui vous ressemblent";
const DESCRIPTION =
  "Focus vous envoie chaque jour des citations choisies selon vos objectifs : rappels, widgets, écran verrouillé, fonds d'écran.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Focus",
    locale: "fr_FR",
    url: SITE_URL,
    title: TITLE,
    description:
      "Des pensées choisies pour vos objectifs, sur votre écran d'accueil et en notification.",
    // A card drawn from the app icon, not a phone capture: at the sizes
    // link previews use, the capture read as a grey rectangle.
    images: [{ url: "/landing/og.png", width: 1200, height: 630, alt: "Focus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/landing/og.png"],
  },
};

/**
 * What search engines read about the app and its publisher: the logo Google
 * shows beside the name is `Organization.logo`, and the store listing shape
 * is `MobileApplication`. Both point at the app icon served from this site.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "ODERA Formations",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 500, height: 500 },
      email: CONTACT_EMAIL,
    },
    {
      "@type": "MobileApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Focus",
      description: DESCRIPTION,
      url: SITE_URL,
      image: `${SITE_URL}/logo.png`,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "iOS, Android",
      inLanguage: ["fr", "en"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Landing locale={locale} t={getMessages(locale).landing} />
    </>
  );
}
