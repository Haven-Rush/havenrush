import type { Metadata } from "next";
import { Domine, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const domine = Domine({
  variable: "--font-domine",
  weight: ["600", "700"],
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Haven Rush",
  description: "Discover and experience places worth showing up for — find an event and go.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${domine.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-linen font-sans text-charcoal">{children}</body>
    </html>
  );
}
