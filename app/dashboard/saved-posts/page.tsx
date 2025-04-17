"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Loader2,
    Pencil,
    Save,
    Trash2,
    Search,
    SlidersHorizontal,
    X,
    Calendar,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    MessageSquare,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface SavedPost {
    id: string
    platform: string
    content: string
    created_at: string
}

// Platform icons mapping
const PlatformIcon = ({ platform }: { platform: string }) => {
    const iconProps = { className: "h-4 w-4 mr-2" }
    
    switch (platform.toLowerCase()) {
        case 'facebook':
            return <Facebook {...iconProps} color="#1877F2" />
        case 'twitter':
        case 'x':
            return <Twitter {...iconProps} color="#1DA1F2" />
        case 'instagram':
            return <Instagram {...iconProps} color="#E4405F" />
        case 'linkedin':
            return <Linkedin {...iconProps} color="#0A66C2" />
        case 'youtube':
            return <Youtube {...iconProps} color="#FF0000" />
        default:
            return <MessageSquare {...iconProps} />
    }
}

export default function SavedPostsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
    const [filteredPosts, setFilteredPosts] = useState<SavedPost[]>([])
    const [editingPost, setEditingPost] = useState<SavedPost | null>(null)
    const [editedContent, setEditedContent] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})
    const [searchQuery, setSearchQuery] = useState("")
    const [showFilterOptions, setShowFilterOptions] = useState(false)
    const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")
    const [activeTab, setActiveTab] = useState("all")

    const router = useRouter()
    const supabase = createClientComponentClient()

    // Get unique platforms
    const platforms = ['all', ...Array.from(new Set(savedPosts.map(post => post.platform.toLowerCase())))]

    useEffect(() => {
        const fetchSavedPosts = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (!user) {
                    router.push("/login")
                    return
                }

                const { data, error } = await supabase
                    .from("saved_posts")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })

                if (error) throw error

                setSavedPosts(data || [])
                setFilteredPosts(data || [])
            } catch (error) {
                console.error("Error fetching saved posts:", error)
                toast("Failed to load your saved posts. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchSavedPosts()
    }, [router, supabase])

    // Filter posts based on search, platform, and sort
    useEffect(() => {
        let filtered = [...savedPosts]
        
        // Filter by platform
        if (activeTab !== 'all') {
            filtered = filtered.filter(post => post.platform.toLowerCase() === activeTab)
        }
        
        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(post => 
                post.content.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        
        // Sort by date
        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return sortBy === "newest" ? dateB - dateA : dateA - dateB
        })
        
        setFilteredPosts(filtered)
    }, [savedPosts, searchQuery, activeTab, sortBy])

    const handleEditPost = (post: SavedPost) => {
        setEditingPost(post)
        setEditedContent(post.content)
        setIsDialogOpen(true)
    }

    const handleSaveEdit = async () => {
        if (!editingPost) return

        setIsSaving(true)

        try {
            const { error } = await supabase
                .from("saved_posts")
                .update({
                    content: editedContent,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", editingPost.id)

            if (error) throw error

            // Update local state
            setSavedPosts((prev) =>
                prev.map((post) => (post.id === editingPost.id ? { ...post, content: editedContent } : post)),
            )

            toast("Post updated successfully.")

            setIsDialogOpen(false)
        } catch (error) {
            console.error("Error updating post:", error)
            toast("Failed to update post. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeletePost = async (postId: string) => {
        setIsDeleting((prev) => ({ ...prev, [postId]: true }))

        try {
            const { error } = await supabase.from("saved_posts").delete().eq("id", postId)

            if (error) throw error

            // Update local state
            setSavedPosts((prev) => prev.filter((post) => post.id !== postId))

            toast("Post deleted successfully.")
        } catch (error) {
            console.error("Error deleting post:", error)
            toast("Failed to delete post. Please try again.")
        } finally {
            setIsDeleting((prev) => ({ ...prev, [postId]: false }))
        }
    }
    
    const clearSearch = () => {
        setSearchQuery("")
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Saved Posts</h1>
                    <p className="text-muted-foreground">View, edit, and manage your saved social media posts.</p>
                </div>
                <Button onClick={() => router.push("/dashboard/generate")}>
                    Create New Post
                </Button>
            </div>

            {savedPosts.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <p className="text-muted-foreground">You haven't saved any posts yet.</p>
                        <Button className="mt-4" onClick={() => router.push("/dashboard/generate")}>
                            Generate Your First Post
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <TabsList className="h-auto p-1">
                                {platforms.map((platform) => (
                                    <TabsTrigger 
                                        key={platform} 
                                        value={platform}
                                        className="flex items-center px-3 py-2 capitalize"
                                    >
                                        {platform !== 'all' && <PlatformIcon platform={platform} />}
                                        {platform}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <div className="flex items-center gap-2">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search posts..."
                                        className="pl-8 pr-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1.5 h-6 w-6"
                                            onClick={clearSearch}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <SlidersHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <div className="p-2">
                                            <p className="text-sm font-medium mb-2">Sort by</p>
                                            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value as "newest" | "oldest")}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sort by" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="newest">Newest first</SelectItem>
                                                    <SelectItem value="oldest">Oldest first</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {platforms.map((platform) => (
                            <TabsContent key={platform} value={platform} className="mt-0">
                                {filteredPosts.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-10 text-center">
                                            <p className="text-muted-foreground">
                                                {searchQuery 
                                                    ? "No posts match your search criteria." 
                                                    : `No posts found for ${platform === 'all' ? 'any platform' : platform}.`}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredPosts.map((post) => (
                                            <Card key={post.id} className="overflow-hidden">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 dark:bg-gray-900">
                                                    <div className="flex items-center">
                                                        <PlatformIcon platform={post.platform} />
                                                        <div>
                                                            <CardTitle className="text-sm">
                                                                <Badge className="capitalize">{post.platform}</Badge>
                                                            </CardTitle>
                                                            <CardDescription className="text-xs flex items-center mt-1">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                {new Date(post.created_at).toLocaleDateString()}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditPost(post)}>
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeletePost(post.id)}
                                                            disabled={isDeleting[post.id]}
                                                        >
                                                            {isDeleting[post.id] ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            )}
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4">
                                                    <p className="whitespace-pre-wrap text-sm line-clamp-6 min-h-[100px]">{post.content}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Post</DialogTitle>
                        <DialogDescription>Make changes to your post content below.</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[200px]"
                    />
                    <DialogFooter>
                        <Button type="submit" onClick={handleSaveEdit} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}