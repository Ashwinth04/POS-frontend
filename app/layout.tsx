import "./globals.css";
import Navbar from "./components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider delayDuration={200}>
          <Navbar />
          <main className="p-6">{children}</main>
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
