import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/hooks/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AI-Based Anemia Risk Prediction System Using Machine Learning",
  description: "AI-powered anemia risk prediction and preliminary health screening using machine learning",
  icons: {
    icon: [
      { url: "/images/anemia-favicon.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/images/anemia-favicon.png",
    apple: "/images/anemia-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans">
      <head />
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster richColors position="top-right" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
