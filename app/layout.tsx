import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Projexa",
  description: "Gestão de projetos técnicos para escritórios de engenharia e arquitetura",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
