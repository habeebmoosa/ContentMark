import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // If user is not signed in and the current path is not / or /login or /signup,
    // redirect the user to /login
    if (!session && !["/", "/login", "/signup", "/auth/callback"].includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // If user is signed in and the current path is /login or /signup,
    // redirect the user to /dashboard
    if (session && ["/login", "/signup"].includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}