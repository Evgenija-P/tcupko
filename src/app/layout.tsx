import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Цупко — засоби захисту та витратні матеріали",
  description: "Інтернет-магазин засобів індивідуального захисту та витратних матеріалів.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
