"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getMessages, Locale } from "@/lib/i18n";

function PrivacyContentInner() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const lang: Locale =
    langParam === "en" || langParam === "fr" ? langParam : "fr";
  const t = getMessages(lang).privacy;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-xl text-primary font-semibold">{t.appName}</p>
          <p className="text-sm text-gray-500 mt-2">{t.lastUpdate}</p>
        </header>

        {/* Intro */}
        <div className="prose prose-gray max-w-none mb-8">
          <p className="text-gray-700">{t.intro}</p>
          <p className="text-gray-700 font-medium">{t.acceptance}</p>
        </div>

        {/* Content */}
        <main className="prose prose-gray max-w-none">
          {/* Section 1 */}
          <Section title={t.sections.s1.title}>
            <p>{t.sections.s1.p1}</p>
            <CompanyInfo />
            <p>{t.sections.s1.p2}</p>
          </Section>

          {/* Section 2 */}
          <Section title={t.sections.s2.title}>
            <p>{t.sections.s2.p1}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s2.list1.map((item, i) => (
                <li key={`s2l1-${i}`}>{item}</li>
              ))}
            </ul>
            <p>{t.sections.s2.p2}</p>
            <p>{t.sections.s2.p3}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s2.list2.map((item, i) => (
                <li key={`s2l2-${i}`}>{item}</li>
              ))}
            </ul>
          </Section>

          {/* Section 3 */}
          <Section title={t.sections.s3.title}>
            <p>{t.sections.s3.p1}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s3.list.map((item, i) => (
                <li key={`s3-${i}`}>{item}</li>
              ))}
            </ul>
            <p>{t.sections.s3.p2}</p>
          </Section>

          {/* Section 4 */}
          <Section title={t.sections.s4.title}>
            <SubSection title={t.sections.s4.s41.title}>
              <p>{t.sections.s4.s41.p1}</p>
              <ul className="list-disc pl-6 space-y-2">
                {t.sections.s4.s41.list.map((item, i) => (
                  <li key={`s41-${i}`}>{item}</li>
                ))}
              </ul>
              <p>{t.sections.s4.s41.p2}</p>
            </SubSection>
            <SubSection title={t.sections.s4.s42.title}>
              <p>{t.sections.s4.s42.p1}</p>
              <p>{t.sections.s4.s42.p2}</p>
              <div className="bg-primary/10 p-4 rounded-lg my-4">
                <ul className="list-disc pl-6 space-y-2">
                  {t.sections.s4.s42.offer.map((item, i) => (
                    <li key={`s42o-${i}`}>
                      <strong>{item}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              <p>{t.sections.s4.s42.p3}</p>
              <p>{t.sections.s4.s42.p4}</p>
              <p className="text-sm text-gray-600 italic">
                {t.sections.s4.s42.p5}
              </p>
            </SubSection>
          </Section>

          {/* Section 5 */}
          <Section title={t.sections.s5.title}>
            <p>{t.sections.s5.p1}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s5.list1.map((item, i) => (
                <li key={`s5-${i}`}>{item}</li>
              ))}
            </ul>
            <p>{t.sections.s5.p2}</p>
          </Section>

          {/* Section 6 */}
          <Section title={t.sections.s6.title}>
            <p>{t.sections.s6.p1}</p>
            <p>{t.sections.s6.p2}</p>
          </Section>

          {/* Section 7 */}
          <Section title={t.sections.s7.title}>
            <p>{t.sections.s7.p1}</p>
            <p>{t.sections.s7.p2}</p>
            <p>{t.sections.s7.p3}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s7.list.map((item, i) => (
                <li key={`s7-${i}`}>{item}</li>
              ))}
            </ul>
            <p>{t.sections.s7.p4}</p>
          </Section>

          {/* Section 8 - Privacy Policy */}
          <Section title={t.sections.s8.title}>
            <SubSection title={t.sections.s8.s81.title}>
              <p>{t.sections.s8.s81.p1}</p>
              <ul className="list-disc pl-6 space-y-2">
                {t.sections.s8.s81.list.map((item, i) => (
                  <li key={`s81-${i}`}>{item}</li>
                ))}
              </ul>
            </SubSection>
            <SubSection title={t.sections.s8.s82.title}>
              <p>{t.sections.s8.s82.p1}</p>
              <ul className="list-disc pl-6 space-y-2">
                {t.sections.s8.s82.list.map((item, i) => (
                  <li key={`s82-${i}`}>{item}</li>
                ))}
              </ul>
            </SubSection>
            <SubSection title={t.sections.s8.s83.title}>
              <p>{t.sections.s8.s83.p1}</p>
              <ul className="list-disc pl-6 space-y-2">
                {t.sections.s8.s83.list.map((item, i) => (
                  <li key={`s83-${i}`}>{item}</li>
                ))}
              </ul>
            </SubSection>
            <SubSection title={t.sections.s8.s84.title}>
              <p>{t.sections.s8.s84.p1}</p>
              <p>{t.sections.s8.s84.p2}</p>
              <ul className="list-disc pl-6 space-y-2">
                {t.sections.s8.s84.list.map((item, i) => (
                  <li key={`s84-${i}`}>{item}</li>
                ))}
              </ul>
            </SubSection>
            <SubSection title={t.sections.s8.s85.title}>
              <p>{t.sections.s8.s85.p1}</p>
            </SubSection>
            <SubSection title={t.sections.s8.s86.title}>
              <p>{t.sections.s8.s86.p1}</p>
              <ul className="list-disc pl-6 space-y-2">
                {t.sections.s8.s86.list.map((item, i) => (
                  <li key={`s86-${i}`}>{item}</li>
                ))}
              </ul>
              <p>
                {t.sections.s8.s86.p2}{" "}
                <EmailLink email="contact@oderaformations.com" />
              </p>
            </SubSection>
          </Section>

          {/* Section 9 */}
          <Section title={t.sections.s9.title}>
            <p>{t.sections.s9.p1}</p>
          </Section>

          {/* Section 10 */}
          <Section title={t.sections.s10.title}>
            <p>{t.sections.s10.p1}</p>
            <p>{t.sections.s10.p2}</p>
          </Section>

          {/* Section 11 */}
          <Section title={t.sections.s11.title}>
            <p>{t.sections.s11.p1}</p>
            <ul className="list-disc pl-6 space-y-2">
              {t.sections.s11.list.map((item, i) => (
                <li key={`s11-${i}`}>{item}</li>
              ))}
            </ul>
          </Section>

          {/* Section 12 */}
          <Section title={t.sections.s12.title}>
            <p>{t.sections.s12.p1}</p>
            <p>{t.sections.s12.p2}</p>
          </Section>

          {/* Section 13 */}
          <Section title={t.sections.s13.title}>
            <p>
              {t.sections.s13.p1}{" "}
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
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
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
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function EmailLink({ email }: Readonly<{ email: string }>) {
  return (
    <a href={`mailto:${email}`} className="text-primary hover:underline">
      {email}
    </a>
  );
}

function CompanyInfo() {
  return (
    <div className="bg-gray-50 p-4 rounded-lg my-4">
      <p className="font-semibold text-gray-900">ODERA Formations</p>
      <p className="text-gray-700">SAS</p>
      <p className="text-gray-700">SIRET : 100 987 569 00017</p>
      <p className="text-gray-700">
        Siège social : 36 Rue Aristide Briand, 69800 Saint-Priest, France
      </p>
      <p className="text-gray-700">
        Email : <EmailLink email="contact@oderaformations.com" />
      </p>
    </div>
  );
}

export default function PrivacyContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <PrivacyContentInner />
    </Suspense>
  );
}
