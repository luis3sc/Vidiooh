import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Si te marca error aquí, bórralo por ahora

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vidiooh App",
  description: "Reescalador de video inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}