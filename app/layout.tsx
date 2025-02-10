import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const neueFont = localFont({
  src: [
    {
      path: './fonts/neue font REG 1.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/neue font BOLD 1.ttf',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-neue'
});

export const metadata: Metadata = {
  title: "ECCO Golf Registration",
  description: "Registration form for ECCO Golf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${neueFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
