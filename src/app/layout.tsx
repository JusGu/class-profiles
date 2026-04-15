import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";
import TabBar from "@/components/TabBar";
import StatusBar from "@/components/StatusBar";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Compare Class Profiles",
  description:
    "A lightweight comparison site for SE 2025, CS 2025, and ECE 2025 shared class profile questions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-webtui-theme="gruvbox-dark-hard">
      <body className={jetbrainsMono.variable}>
        <div className="ide-container">
          <div className="ide-main">
            <div className="editor-area">
              <TabBar />
              {children}
            </div>
          </div>
          <StatusBar />
        </div>
      </body>
    </html>
  );
}
