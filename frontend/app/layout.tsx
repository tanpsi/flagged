import type { Metadata } from "next";
import "./globals.css";
import '@vscode/codicons/dist/codicon.css';
import Navbar from "./components/Navbar"; // ✅ Import the new Navbar component


export const metadata: Metadata = {
  title: "CTFd - Flagged",
  description: "A Capture The Flag platform for learning and competition",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jaini+Purva&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="transition-colors duration-300">
        <Navbar /> {/* ✅ Dynamically rendered navbar */}
        <main className="pt-20 min-h-[calc(100vh-80px)] flex flex-col animate-fade-in bg-[#221633] dark:bg-[#221633]">
          {children}
        </main>
        <footer className="bg-gray-800 dark:bg-gray-800 py-4">
          <div className="container mx-auto text-center text-gray-400">
            <p>© 2025 Flagged CTFd. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
