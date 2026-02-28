import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AlertDialogProvider } from "@/components/ui/alert-dialog-provider";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/lib/providers/QueryProvider";
import { SettingsProvider } from "@/lib/providers/SettingsProvider";
import { AuthProvider } from "@/lib/providers/AuthProvider";
import { NotificationProvider } from "@/lib/providers/NotificationProvider";
import JitsiScriptLoader from "@/components/jitsi/JitsiScriptLoader";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neplearns.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Neplearns - Nepal's Smart Learning Platform",
    template: "%s | Neplearns",
  },
  description:
    "Prepare for SEE and +2 exams with Nepal's top educators. Daily live classes, video lessons, practice tests, and expert guidance.",
  keywords: [
    "SEE preparation Nepal",
    "Plus 2 online classes",
    "+2 Science classes Nepal",
    "+2 Management classes",
    "Online learning Nepal",
    "SEE exam preparation",
    "NEB board exam",
    "Nepali online education",
    "Live classes Nepal",
    "Neplearns",
  ],
  authors: [{ name: "Neplearns" }],
  creator: "Neplearns",
  publisher: "Neplearns",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Neplearns",
    title: "Neplearns - Nepal's Smart Learning Platform",
    description:
      "Prepare for SEE and +2 exams with Nepal's top educators. Daily live classes, video lessons, practice tests, and expert guidance.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Neplearns - Online Learning Platform for Nepali Students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neplearns - Nepal's Smart Learning Platform",
    description:
      "Prepare for SEE and +2 exams with Nepal's top educators. Daily live classes and expert guidance.",
    images: ["/images/og-image.png"],
    creator: "@neplearns",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Zoom SDK Requirements */}
        <link
          type="text/css"
          rel="stylesheet"
          href="https://source.zoom.us/2.21.0/css/bootstrap.css"
        />
        <link
          type="text/css"
          rel="stylesheet"
          href="https://source.zoom.us/2.21.0/css/react-select.css"
        />
        <script
          src="https://source.zoom.us/zoom-meeting-2.21.0.min.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="overflow-x-hidden" suppressHydrationWarning>
        <JitsiScriptLoader />
        <QueryProvider>
          <SettingsProvider>
            <AuthProvider>
              <NotificationProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem
                  disableTransitionOnChange
                >
                  <AlertDialogProvider>
                    {children}
                    <Toaster />
                  </AlertDialogProvider>
                </ThemeProvider>
              </NotificationProvider>
            </AuthProvider>
          </SettingsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}