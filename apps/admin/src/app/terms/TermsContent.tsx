"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getMessages, Locale } from "@/lib/i18n";

function TermsContentInner() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const lang: Locale =
    langParam === "en" || langParam === "fr" ? langParam : "fr";
  const t = getMessages(lang).terms;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-xl text-primary font-semibold">{t.appName}</p>
          <p className="text-sm text-gray-500 mt-2">{t.lastUpdate}</p>
        </header>

        {/* Content */}
        <main className="prose prose-gray max-w-none">
          {/* Section 1 */}
          <Section title={t.sections.s1.title}>
            <p>{t.sections.s1.p1}</p>
            <p>{t.sections.s1.p2}</p>
            <p>{t.sections.s1.p3}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s1.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>
              {t.sections.s1.p4}{" "}
              <EmailLink email="contact@oderaformations.com" />
            </p>
            <p>{t.sections.s1.p5}</p>
          </Section>

          {/* Section 2 */}
          <Section title={t.sections.s2.title}>
            <p>{t.sections.s2.p1}</p>
            <CompanyInfo
              address={t.sections.s2.address}
              emailLabel={t.sections.s2.email}
            />
          </Section>

          {/* Section 3 */}
          <Section title={t.sections.s3.title}>
            <p>{t.sections.s3.p1}</p>
            <p>{t.sections.s3.p2}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s3.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>
              {t.sections.s3.p3}{" "}
              <EmailLink email="contact@oderaformations.com" />
            </p>
          </Section>

          {/* Section 4 */}
          <Section title={t.sections.s4.title}>
            <p>{t.sections.s4.p1}</p>
            <p>{t.sections.s4.p2}</p>
          </Section>

          {/* Section 5 */}
          <Section title={t.sections.s5.title}>
            <p>{t.sections.s5.p1}</p>
            <p>{t.sections.s5.p2}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s5.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Section>

          {/* Section 6 */}
          <Section title={t.sections.s6.title}>
            <p>{t.sections.s6.p1}</p>
            <ol className="list-decimal pl-6 space-y-2">
              {t.sections.s6.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
            <p>{t.sections.s6.p2}</p>
            <p>{t.sections.s6.p3}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <a
                  href="https://www.apple.com/legal/internet-services/itunes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {t.sections.s6.appleLink}
                </a>
              </li>
              <li>
                <a
                  href="https://play.google.com/intl/fr/about/play-terms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {t.sections.s6.googleLink}
                </a>
              </li>
            </ul>
          </Section>

          {/* Section 7 */}
          <Section title={t.sections.s7.title}>
            <SubSection title={t.sections.s7.s71.title}>
              <p>{t.sections.s7.s71.p1}</p>
              <div className="bg-primary/10 p-4 rounded-lg my-4">
                <ul className="list-disc pl-6 space-y-2">
                  {t.sections.s7.s71.offer.map((item, i) => (
                    <li key={i}>
                      <strong>{item}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              <p>{t.sections.s7.s71.p2}</p>
            </SubSection>
            <SubSection title={t.sections.s7.s72.title}>
              <p>{t.sections.s7.s72.p1}</p>
              <ul className="list-disc pl-6 space-y-2">
                {t.sections.s7.s72.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p>{t.sections.s7.s72.p2}</p>
            </SubSection>
            <SubSection title={t.sections.s7.s73.title}>
              <p>{t.sections.s7.s73.p1}</p>
            </SubSection>
          </Section>

          {/* Section 8 */}
          <Section title={t.sections.s8.title}>
            <SubSection title={t.sections.s8.s81.title}>
              <p>{t.sections.s8.s81.p1}</p>
            </SubSection>
            <SubSection title={t.sections.s8.s82.title}>
              <p>{t.sections.s8.s82.p1}</p>
              <p>{t.sections.s8.s82.p2}</p>
            </SubSection>
            <SubSection title={t.sections.s8.s83.title}>
              <p>{t.sections.s8.s83.p1}</p>
              <p>{t.sections.s8.s83.p2}</p>
            </SubSection>
          </Section>

          {/* Section 9 */}
          <Section title={t.sections.s9.title}>
            <p>{t.sections.s9.p1}</p>
            <p>{t.sections.s9.p2}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s9.list.map((item, i) => (
                <li key={`s9-${i}`}>{item}</li>
              ))}
            </ul>
          </Section>

          {/* Section 10 */}
          <Section title={t.sections.s10.title}>
            <p>{t.sections.s10.p1}</p>
          </Section>

          {/* Section 11 */}
          <Section title={t.sections.s11.title}>
            <p>{t.sections.s11.p1}</p>
          </Section>

          {/* Section 12 */}
          <Section title={t.sections.s12.title}>
            <p>{t.sections.s12.p1}</p>
            <p>{t.sections.s12.p2}</p>
          </Section>

          {/* Section 13 */}
          <Section title={t.sections.s13.title}>
            <p>{t.sections.s13.p1}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s13.list.map((item, i) => (
                <li key={`s13-${i}`}>{item}</li>
              ))}
            </ul>
            <p>{t.sections.s13.p2}</p>
          </Section>

          {/* Section 14 */}
          <Section title={t.sections.s14.title}>
            <p>{t.sections.s14.p1}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s14.list.map((item, i) => (
                <li key={`s14-${i}`}>{item}</li>
              ))}
            </ul>
          </Section>

          {/* Section 15 */}
          <Section title={t.sections.s15.title}>
            <p>{t.sections.s15.p1}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s15.list.map((item, i) => (
                <li key={`s15-${i}`}>{item}</li>
              ))}
            </ul>
          </Section>

          {/* Section 16 */}
          <Section title={t.sections.s16.title}>
            <p>{t.sections.s16.p1}</p>
          </Section>

          {/* Section 17 */}
          <Section title={t.sections.s17.title}>
            <p>{t.sections.s17.p1}</p>
            <p>{t.sections.s17.p2}</p>
          </Section>

          {/* Section 18 */}
          <Section title={t.sections.s18.title}>
            <p>
              {t.sections.s18.p1}{" "}
              <EmailLink email="contact@oderaformations.com" />
            </p>
          </Section>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} {t.footer.copyright}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {t.footer.contact}{" "}
              <EmailLink email="contact@oderaformations.com" />
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// Helper components
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">
        {title}
      </h2>
      <div className="text-gray-700 leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function EmailLink({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className="text-primary hover:underline">
      {email}
    </a>
  );
}

function CompanyInfo({
  address,
  emailLabel,
}: {
  address: string;
  emailLabel: string;
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="font-semibold text-gray-900">ODERA Formations</p>
      <p className="text-gray-700">SAS</p>
      <p className="text-gray-700">SIRET : 100 987 569 00017</p>
      <p className="text-gray-700">{address}</p>
      <p className="text-gray-700">
        {emailLabel} <EmailLink email="contact@oderaformations.com" />
      </p>
    </div>
  );
}

export default function TermsContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <TermsContentInner />
    </Suspense>
  );
}
