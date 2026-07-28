import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaizeGuard Rwanda — Visible maize quality screening",
  description:
    "Upload a maize image, get a quality category, confidence and a post-harvest action.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
