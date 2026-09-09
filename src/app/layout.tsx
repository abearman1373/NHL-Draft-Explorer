import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { NavBar } from "@/components/nav-bar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NHL Draft Explorer",
  description: "Explore six decades of NHL Entry Draft picks — players, teams, and draft value by round.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NavBar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
            Data: NHL Entry Draft picks, 1963–2022 · Built with Next.js, shadcn/ui &amp; Supabase
          </footer>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
