import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import { ModeProvider } from "@/lib/mode-context";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "portlyfolio.site - Your Portfolio. Your Story.",
  description: "Create a stunning portfolio in minutes on portlyfolio.site and showcase your projects with beautiful templates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-mode="professional" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased m-transition`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <ModeProvider>
            <AuthProvider>
              {children}
              <Toaster position="bottom-right" />
              <Analytics />
            </AuthProvider>
          </ModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
