import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Sidechat } from '@/components/sidechat'
import { Toaster } from '@/components/ui/toaster'
import { CurrentDocumentProvider } from '@/providers/current-document'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Document Management System',
  description: 'AI-powered document management with LangGraph',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CurrentDocumentProvider>
            {children}
            <Sidechat />
            <Toaster />
            <Analytics />
          </CurrentDocumentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
