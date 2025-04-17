"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
    Loader2, 
    Save, 
    Settings, 
    Facebook, 
    Twitter, 
    Linkedin, 
    MessageSquare, 
    RefreshCw
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface KnowledgeBase {
  id: string
  topics: string[]
  tone: string
  target_audience: string
  hashtags: string[]
}

interface GeneratedPost {
  id: string
  content: string
}

type Platform = "linkedin" | "twitter" | "reddit"

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({})
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null)
  const [platform, setPlatform] = useState<Platform>("linkedin")
  
  // Platform-specific state for generated posts
  const [linkedinPosts, setLinkedinPosts] = useState<GeneratedPost[]>([])
  const [twitterPosts, setTwitterPosts] = useState<GeneratedPost[]>([])
  const [redditPosts, setRedditPosts] = useState<GeneratedPost[]>([])
  
  // Platform-specific state for edited content
  const [linkedinEditedContent, setLinkedinEditedContent] = useState<Record<string, string>>({})
  const [twitterEditedContent, setTwitterEditedContent] = useState<Record<string, string>>({})
  const [redditEditedContent, setRedditEditedContent] = useState<Record<string, string>>({})

  const router = useRouter()
  const supabase = createClientComponentClient()

  // Platform icons and colors mapping
  const platformConfig = {
    linkedin: { 
      icon: <Linkedin className="h-5 w-5 mr-2" color="#0A66C2" />, 
      color: "#0A66C2",
      description: "Generate professional, long-form posts optimized for LinkedIn's business audience."
    },
    twitter: { 
      icon: <Twitter className="h-5 w-5 mr-2" color="#1DA1F2" />, 
      color: "#1DA1F2",
      description: "Generate short, engaging tweets under 280 characters for Twitter/X."
    },
    reddit: { 
      icon: <MessageSquare className="h-5 w-5 mr-2" color="#FF4500" />, 
      color: "#FF4500",
      description: "Generate discussion-oriented posts with relevant context for Reddit communities."
    }
  }

  // Helper function to get current platform's posts
  const getCurrentPlatformPosts = (): GeneratedPost[] => {
    switch (platform) {
      case "linkedin":
        return linkedinPosts
      case "twitter":
        return twitterPosts
      case "reddit":
        return redditPosts
      default:
        return []
    }
  }

  // Helper function to get current platform's edited content
  const getCurrentEditedContent = (): Record<string, string> => {
    switch (platform) {
      case "linkedin":
        return linkedinEditedContent
      case "twitter":
        return twitterEditedContent
      case "reddit":
        return redditEditedContent
      default:
        return {}
    }
  }

  // Helper function to set current platform's edited content
  const setCurrentEditedContent = (newContent: Record<string, string>) => {
    switch (platform) {
      case "linkedin":
        setLinkedinEditedContent(newContent)
        break
      case "twitter":
        setTwitterEditedContent(newContent)
        break
      case "reddit":
        setRedditEditedContent(newContent)
        break
    }
  }

  // Helper function to set current platform's posts
  const setCurrentPlatformPosts = (posts: GeneratedPost[]) => {
    switch (platform) {
      case "linkedin":
        setLinkedinPosts(posts)
        break
      case "twitter":
        setTwitterPosts(posts)
        break
      case "reddit":
        setRedditPosts(posts)
        break
    }
  }

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

        if (error) {
          if (error.code === "PGRST116") {
            // No knowledge base found
            toast("Please set up your knowledge base before generating posts.")
            router.push("/dashboard/knowledge-base")
            return
          }
          throw error
        }

        setKnowledgeBase(data)
      } catch (error) {
        console.error("Error fetching knowledge base:", error)
        toast("Failed to load your knowledge base. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchKnowledgeBase()
  }, [router, supabase])

  const generatePosts = async () => {
    if (!knowledgeBase) return

    setIsGenerating(true)
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          knowledgeBase,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate posts")
      }

      const data = await response.json()

      // Create unique IDs for each post
      const postsWithIds = data.posts.map((content: string) => ({
        id: crypto.randomUUID(),
        content,
      }))

      // Set platform-specific posts
      setCurrentPlatformPosts(postsWithIds)

      // Initialize edited content with the original content
      const initialEditedContent: Record<string, string> = {}
      postsWithIds.forEach((post: GeneratedPost) => {
        initialEditedContent[post.id] = post.content
      })
      
      // Set platform-specific edited content
      setCurrentEditedContent(initialEditedContent)
    } catch (error) {
      console.error("Error generating posts:", error)
      toast("Failed to generate posts. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSavePost = async (postId: string) => {
    setIsSaving((prev) => ({ ...prev, [postId]: true }))

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const currentEditedContent = getCurrentEditedContent()
      const currentPosts = getCurrentPlatformPosts()
      
      const content = currentEditedContent[postId] || currentPosts.find((p) => p.id === postId)?.content || ""

      const { error } = await supabase.from("saved_posts").insert({
        user_id: user.id,
        platform,
        content,
      })

      if (error) throw error

      toast("Post saved successfully.")
    } catch (error) {
      console.error("Error saving post:", error)
      toast("Failed to save post. Please try again.")
    } finally {
      setIsSaving((prev) => ({ ...prev, [postId]: false }))
    }
  }

  const handleContentChange = (postId: string, content: string) => {
    const currentEditedContent = getCurrentEditedContent()
    setCurrentEditedContent({
      ...currentEditedContent,
      [postId]: content,
    })
  }

  const handlePlatformChange = (value: Platform) => {
    setPlatform(value)
  }

  const handlePreferencesClick = () => {
    toast("Preferences feature coming soon!")
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentPosts = getCurrentPlatformPosts()
  const currentEditedContent = getCurrentEditedContent()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Posts</h1>
          <p className="text-muted-foreground">Create AI-powered social media posts based on your knowledge base.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/saved-posts")} variant="outline">
          View Saved Posts
        </Button>
      </div>

      <Card className="overflow-hidden border-2 border-muted">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 pb-4">
          <CardTitle>Platform Selection</CardTitle>
          <CardDescription>Choose a platform to generate optimized posts for</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={platform} onValueChange={(value) => handlePlatformChange(value as Platform)}>
            <TabsList className="grid  grid-cols-3">
              {Object.entries(platformConfig).map(([key, config]) => (
                <TabsTrigger key={key} value={key} className="flex items-center justify-center">
                  {config.icon}
                  <span className="capitalize">{key}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(platformConfig).map(([key, config]) => (
              <TabsContent key={key} value={key} className="mt-4 p-2">
                <div className="flex items-start">
                  <div 
                    className="w-1 h-16 mr-3 rounded-full" 
                    style={{ backgroundColor: config.color }}
                  />
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-900 mt-4 flex items-center justify-between">
          <Button onClick={generatePosts} disabled={isGenerating} className="px-6">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Posts
              </>
            )}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handlePreferencesClick} 
                  variant="outline" 
                  size="icon"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generation Preferences</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>

      {currentPosts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center">
            {platformConfig[platform].icon}
            Generated Posts for {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {currentPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden border-2 border-muted">
                <CardHeader className="bg-gray-50 dark:bg-gray-900 pb-3 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center">
                    {platformConfig[platform].icon}
                    <CardTitle className="text-sm capitalize">{platform} Post</CardTitle>
                  </div>
                  <div 
                    className="w-8 h-1 rounded-full" 
                    style={{ backgroundColor: platformConfig[platform].color }}
                  />
                </CardHeader>
                <CardContent className="pt-4">
                  <Textarea
                    value={currentEditedContent[post.id] || post.content}
                    onChange={(e) => handleContentChange(post.id, e.target.value)}
                    className="min-h-[200px] resize-none text-sm"
                    placeholder="Post content..."
                  />
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-900 flex justify-end">
                  <Button 
                    onClick={() => handleSavePost(post.id)} 
                    disabled={isSaving[post.id]} 
                    style={{ backgroundColor: isSaving[post.id] ? undefined : platformConfig[platform].color }}
                  >
                    {isSaving[post.id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Post
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}