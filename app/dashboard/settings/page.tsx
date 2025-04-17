"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"

interface Profile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
}

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [fullName, setFullName] = useState("")

    const router = useRouter()
    //   const { toast } = useToast()
    const { user } = useSupabase()
    const supabase = createClientComponentClient()

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                router.push("/login")
                return
            }

            try {
                const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

                if (error) throw error

                setProfile(data)
                setFullName(data.full_name || "")
            } catch (error) {
                console.error("Error fetching profile:", error)
                toast("Failed to load your profile. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [router, supabase, toast, user])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: fullName,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user?.id)

            if (error) throw error

            toast("Your profile has been updated.")

            router.refresh()
        } catch (error) {
            console.error("Error updating profile:", error)
            toast("Failed to update your profile. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and profile.</p>
            </div>

            <Card>
                <form onSubmit={handleUpdateProfile}>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Update your profile information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user?.email || ""} disabled />
                            <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="full-name">Full Name</Label>
                            <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Password changes are handled through the authentication provider you used to sign up.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            supabase.auth.resetPasswordForEmail(user?.email || "", {
                                redirectTo: `${window.location.origin}/auth/callback`,
                            })
                            toast("Check your email for a password reset link.")
                        }}
                    >
                        Reset Password
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}