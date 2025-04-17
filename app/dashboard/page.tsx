import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, Settings } from "lucide-react"

export default async function Dashboard() {
  const cookieStore = cookies();
  
  // Then pass it to createServerComponentClient
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get knowledge base count
  const { count: knowledgeBaseCount } = await supabase
    .from("knowledge_bases")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)

  // Get saved posts count
  const { count: savedPostsCount } = await supabase
    .from("saved_posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)

  // Get recent saved posts
  const { data: recentPosts } = await supabase
    .from("saved_posts")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to ContentMark, your AI-powered social media content generator.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Bases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeBaseCount || 0}</div>
            <p className="text-xs text-muted-foreground">Content preferences you've set up</p>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/dashboard/knowledge-base">{knowledgeBaseCount ? "Manage" : "Create"} Knowledge Base</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedPostsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Posts you've generated and saved</p>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/dashboard/saved-posts">View Saved Posts</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full" variant="default">
              <Link href="/dashboard/generate">
                <Plus className="mr-2 h-4 w-4" />
                Generate New Posts
              </Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/knowledge-base">
                <FileText className="mr-2 h-4 w-4" />
                Update Knowledge Base
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight">Recent Posts</h2>
        <div className="mt-4 space-y-4">
          {recentPosts && recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle className="text-sm capitalize">{post.platform}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(post.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm">{post.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">No posts saved yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/generate">Generate Your First Post</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {savedPostsCount > 3 && (
            <div className="text-center">
              <Button asChild variant="ghost">
                <Link href="/dashboard/saved-posts">View All Posts</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}