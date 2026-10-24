import type { Metadata } from "next";
import { Heebo, Rubik } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "אולר הסושיאל | Olar Social",
  description: "המולטי-טול שלך לסושיאל • בשליפה אחת",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" suppressHydrationWarning>
      <body className={`${heebo.variable} ${rubik.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
