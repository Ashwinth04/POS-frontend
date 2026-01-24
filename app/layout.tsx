import "./globals.css"
import Navbar from "./components/navbar"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="p-6">{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
