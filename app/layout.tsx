import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { HoverHeaderWrapper } from "@/components/hover-header-wrapper"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Visualization Exercise Tool",
  description: "Improve your ability to form mental images and achieve prophantasia.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <ThemeProvider>
          <HoverHeaderWrapper />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
