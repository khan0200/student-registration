import type { Metadata } from "next";
import "./globals.css";
import Sidebar, { SidebarProvider } from "./components/Sidebar";
import MainContent from "./components/MainContent";
import ClientOnly from "./components/ClientOnly";

export const metadata: Metadata = {
  title: "UniApp - Professional Student Management",
  description: "Enterprise-grade student management system with sophisticated business interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased min-h-screen text-business-body"
        suppressHydrationWarning={true}
      >
        <ClientOnly>
          <SidebarProvider>
            <div className="min-h-screen bg-gray-50">
              <Sidebar />
              <MainContent>{children}</MainContent>
            </div>
          </SidebarProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
