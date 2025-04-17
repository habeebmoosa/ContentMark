"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Settings, LogOut, Menu, X } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user, signOut } = useSupabase()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "Knowledge Base",
      href: "/dashboard/knowledge-base",
      icon: FileText,
      current: pathname === "/dashboard/knowledge-base",
    },
    {
      name: "Generate Posts",
      href: "/dashboard/generate",
      icon: FileText,
      current: pathname === "/dashboard/generate",
    },
    {
      name: "Saved Posts",
      href: "/dashboard/saved-posts",
      icon: FileText,
      current: pathname === "/dashboard/saved-posts",
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      current: pathname === "/dashboard/settings",
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Fixed Sidebar for desktop */}
      <div className="hidden md:block md:w-64 md:flex-none">
        <div className="fixed inset-y-0 left-0 z-20 w-64 flex flex-col border-r border-border bg-card">
          <div className="flex items-center flex-shrink-0 h-16 px-6 border-b border-border">
            <h1 className="text-xl font-bold">ContentMark</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      item.current
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-accent-foreground"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex-shrink-0 border-t border-border p-4">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" className="mt-2 justify-start w-full" onClick={() => signOut()}>
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - fixed positioning */}
      <div className="md:hidden">
        <div className={`fixed inset-0 z-40 flex ${isMobileMenuOpen ? "visible" : "invisible"}`}>
          <div
            className={`fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
              isMobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div
            className={`relative flex w-full max-w-xs flex-1 flex-col bg-card transform transition ease-in-out duration-300 ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" aria-hidden="true" />
                <span className="sr-only">Close sidebar</span>
              </button>
            </div>
            <div className="flex flex-shrink-0 items-center h-16 px-4 border-b border-border">
              <h1 className="text-xl font-bold">ContentMark</h1>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-4">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      item.current
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <item.icon
                      className={`mr-4 h-6 w-6 flex-shrink-0 ${
                        item.current
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-accent-foreground"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 border-t border-border p-4">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" className="mt-2 justify-start w-full" onClick={() => signOut()}>
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-10 flex h-16 flex-shrink-0 border-b border-border bg-background md:hidden">
        <button
          type="button"
          className="border-r border-border px-4 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex flex-1 justify-between px-4">
          <div className="flex flex-1 items-center">
            <h1 className="text-xl font-bold">ContentMark</h1>
          </div>
        </div>
      </div>

      {/* Main content - with padding to account for fixed elements */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1">
          <div className="py-6">
            {/* Add top padding on mobile for the fixed header */}
            <div className="pt-16 md:pt-0 mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}