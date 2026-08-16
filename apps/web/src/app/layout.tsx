import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { EnvironmentProvider } from "@/contexts/EnvironmentContext";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { SITE_URL } from "@/lib/links";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The favicon, icon.png and apple-icon.png beside this file are the app's
// own icon — Next picks them up by name and links them on every page.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Focus - Admin Panel",
  description: "Focus Admin Panel - Manage quotes, topics, and users",
  applicationName: "Focus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LocaleProvider>
              <EnvironmentProvider>{children}</EnvironmentProvider>
            </LocaleProvider>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
