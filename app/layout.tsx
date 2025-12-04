import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import FloatingActionButton from "./components/FloatingActionButton";
import Link from "next/link"; // Import Link for the header logo

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini Twitter",
  description: "A mini twitter clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <AuthProvider>
          <div className="md:flex md:justify-center">
            {/* Sidebar for Desktop */}
            <div className="hidden md:flex">
              <Sidebar />
            </div>
            
            {/* Mobile Header (only visible on small screens) */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-950 border-b border-gray-800 h-14 flex items-center px-4 z-20">
              <Link href="/" className="text-xl font-bold tracking-tight text-white">
                MiniTwitter
              </Link>
            </div>

            {/* Main Content */}
            {/* Added pt-14 for mobile to account for the fixed header */}
            <main className="flex-1 max-w-2xl min-h-screen md:border-l md:border-r border-gray-800 pb-16 md:pb-0 pt-14 md:pt-0">
              {children}
            </main>

            {/* Mobile Navigation */}
            <Navbar />
            <FloatingActionButton />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
