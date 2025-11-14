import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/session-provider";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import MobileHeader from "@/components/navigation/mobile-header";
import MobileBottomNav from "@/components/navigation/mobile-bottom-nav";
import { Header } from "@/components/header";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TutorConnect - Find Your Perfect Tutor",
  description: "Connect with qualified tutors for personalized learning experiences. Online and in-person tutoring available.",
  keywords: ["tutoring", "education", "learning", "online tutoring", "private tutors"],
  authors: [{ name: "TutorConnect Team" }],
  openGraph: {
    title: "TutorConnect",
    description: "Find your perfect tutor for personalized learning",
    url: "https://tutorconnect.com",
    siteName: "TutorConnect",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TutorConnect",
    description: "Find your perfect tutor for personalized learning",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TutorConnect",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col">
              {/* Desktop Header */}
              <div className="desktop-only">
                <Header />
              </div>
              
              {/* Mobile Header */}
              <div className="mobile-only">
                <MobileHeader />
              </div>
              
              {/* Main Content */}
              <main className="flex-1 pb-16 md:pb-0">
                <div className="mobile-container mobile-spacing">
                  {children}
                </div>
              </main>
              
              {/* Mobile Bottom Navigation */}
              <div className="mobile-only">
                <MobileBottomNav />
              </div>
            </div>
            <Toaster />
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
