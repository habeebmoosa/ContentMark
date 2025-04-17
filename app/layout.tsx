import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { SupabaseProvider } from "@/components/supabase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ContentMark - AI-Powered Social Media Content",
  description: "Generate engaging social media content for LinkedIn, Twitter, and Reddit",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange> */}
          <SupabaseProvider>
            {children}
            <Toaster />
          </SupabaseProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}

