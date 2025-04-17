"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkUser()
  }, [supabase])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 px-5 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-primary">ContentMark</span>
          </div>
          <nav className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="cursor-pointer">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Generate engaging <span className="text-primary">social media content</span> with AI
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              ContentMark helps you create platform-optimized posts for LinkedIn, Twitter, and Reddit using the power of
              AI.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">How it works</h2>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="mt-4 text-xl font-bold">Create a Knowledge Base</h3>
              <p className="mt-2 text-muted-foreground">
                Provide details about your content preferences, topics, tone, and target audience.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="mt-4 text-xl font-bold">Generate AI-Powered Posts</h3>
              <p className="mt-2 text-muted-foreground">Select a platform and generate 5-6 optimized posts using AI.</p>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <h3 className="mt-4 text-xl font-bold">Save & Manage Posts</h3>
              <p className="mt-2 text-muted-foreground">
                Save your preferred posts to your profile and manage them easily.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="mx-auto text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ContentMark. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}