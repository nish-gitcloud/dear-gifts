import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";

// Exactly three font families total (spec section 51): a modern sans for
// body/UI text, an elegant display serif for headings/emotional moments,
// and a handwritten script reserved for the final letter.
const bodyFont = Plus_Jakarta_Sans({ variable: "--font-body", subsets: ["latin"] });
const displayFont = Playfair_Display({ variable: "--font-display", subsets: ["latin"] });
const handFont = Caveat({ variable: "--font-hand", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Dear Gifts — Make Someone Feel Special",
  description:
    "Turn your memories, wishes and feelings into an unforgettable digital surprise.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffaf7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} ${handFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
