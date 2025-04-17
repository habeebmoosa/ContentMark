import type React from "react"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
        redirect("/login")
    }

    return <DashboardLayout>{children}</DashboardLayout>
}