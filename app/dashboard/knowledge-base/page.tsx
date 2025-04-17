"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface KnowledgeBase {
    id: string
    topics: string[]
    tone: string
    target_audience: string
    hashtags: string[]
}

export default function KnowledgeBasePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null)
    const [topics, setTopics] = useState("")
    const [tone, setTone] = useState("")
    const [targetAudience, setTargetAudience] = useState("")
    const [hashtags, setHashtags] = useState("")

    const router = useRouter()
    //   const { toast } = useToast()
    const supabase = createClientComponentClient()

    useEffect(() => {
        const fetchKnowledgeBase = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (!user) {
                    router.push("/login")
                    return
                }

                const { data, error } = await supabase.from("knowledge_bases").select("*").eq("user_id", user.id).single()

                if (error && error.code !== "PGRST116") {
                    throw error
                }

                if (data) {
                    setKnowledgeBase(data)
                    setTopics(data.topics.join(", "))
                    setTone(data.tone)
                    setTargetAudience(data.target_audience)
                    setHashtags(data.hashtags.join(", "))
                }
            } catch (error) {
                console.error("Error fetching knowledge base:", error)
                toast("Failed to load your knowledge base. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchKnowledgeBase()
    }, [router, supabase, toast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login")
                return
            }

            const topicsArray = topics
                .split(",")
                .map((topic) => topic.trim())
                .filter(Boolean)
            const hashtagsArray = hashtags
                .split(",")
                .map((hashtag) => hashtag.trim())
                .filter(Boolean)

            if (knowledgeBase) {
                // Update existing knowledge base
                const { error } = await supabase
                    .from("knowledge_bases")
                    .update({
                        topics: topicsArray,
                        tone,
                        target_audience: targetAudience,
                        hashtags: hashtagsArray,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", knowledgeBase.id)

                if (error) throw error
            } else {
                // Create new knowledge base
                const { error } = await supabase.from("knowledge_bases").insert({
                    user_id: user.id,
                    topics: topicsArray,
                    tone,
                    target_audience: targetAudience,
                    hashtags: hashtagsArray,
                })

                if (error) throw error
            }

            toast("Your knowledge base has been saved.")

            router.refresh()
        } catch (error) {
            console.error("Error saving knowledge base:", error)
            toast("Failed to save your knowledge base. Please try again.")
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
                <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                <p className="text-muted-foreground">Set up your content preferences to generate better social media posts.</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Content Preferences</CardTitle>
                        <CardDescription>
                            This information will be used to generate social media posts tailored to your preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="topics">Topics</Label>
                            <Textarea
                                id="topics"
                                placeholder="AI, startups, coding, marketing (comma separated)"
                                value={topics}
                                onChange={(e) => setTopics(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter topics you want to create content about, separated by commas.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tone">Tone</Label>
                            <Input
                                id="tone"
                                placeholder="Professional, casual, witty, informative"
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Describe the tone you want your content to have.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="target-audience">Target Audience</Label>
                            <Textarea
                                id="target-audience"
                                placeholder="Tech professionals, startup founders, marketers"
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Describe your target audience in detail.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hashtags">Hashtags or Keywords</Label>
                            <Input
                                id="hashtags"
                                placeholder="#tech, #startups, #AI (comma separated)"
                                value={hashtags}
                                onChange={(e) => setHashtags(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter hashtags or keywords you want to include, separated by commas.
                            </p>
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
                                "Save Knowledge Base"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}