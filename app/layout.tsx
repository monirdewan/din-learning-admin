import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduLearn Admin",
  description: "Admin panel for Student-Teacher Learning Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
