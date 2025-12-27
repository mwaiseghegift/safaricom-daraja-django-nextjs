import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { Sidebar, MobileMenuButton } from "@/components/Sidebar";
import { ToastContainer } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "M-Pesa Daraja API - Dashboard",
  description: "Modern dashboard for Safaricom Daraja M-Pesa API integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />
            <div className="flex-1 lg:ml-64">
              <MobileMenuButton />
              <main className="p-4 lg:p-8">
                {children}
              </main>
            </div>
          </div>
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
