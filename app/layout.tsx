import type { Metadata } from "next";
import { Archivo_Black, Inter, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "SoldesBTP.ma — Le stock dormant devient une bonne affaire",
  description:
    "La marketplace marocaine qui connecte importateurs et revendeurs ayant du stock dormant avec les professionnels et particuliers du BTP en recherche de bonnes affaires.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${archivoBlack.variable} ${inter.variable} ${plexMono.variable}`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
