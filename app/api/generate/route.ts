import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const openai = createOpenAI({
  baseURL: process.env.OPENAI_API_ENDPOINT,
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    // Verify authentication
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const { platform, knowledgeBase } = await request.json()

    if (!platform || !knowledgeBase) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Format topics and hashtags for the prompt
    const topics = knowledgeBase.topics.join(", ")
    const hashtags = knowledgeBase.hashtags.join(", ")

    // Create platform-specific prompt
    let systemPrompt = `You are an expert social media content creator. 
Generate 5 high-quality ${platform} posts about the following topics: ${topics}.
Use a ${knowledgeBase.tone} tone and target the following audience: ${knowledgeBase.target_audience}.`

    if (hashtags && hashtags.length > 0) {
      systemPrompt += ` Include these hashtags where appropriate: ${hashtags}.`
    }

    // Add platform-specific instructions
    switch (platform) {
      case "linkedin":
        systemPrompt += `
Format as professional LinkedIn posts with clear paragraphs.
Each post should be 3-4 paragraphs long and include a call to action.
Make the content insightful and valuable for professional networking.`
        break
      case "twitter":
        systemPrompt += `
Format as short, engaging tweets under 280 characters.
Make them punchy, memorable, and shareable.
Include relevant hashtags from the provided list.`
        break
      case "reddit":
        systemPrompt += `
Format as discussion-oriented Reddit posts with relevant context.
Include a clear title (in quotes at the top) and a detailed body.
Make the content conversational and designed to spark discussion.`
        break
      default:
        return NextResponse.json({ error: "Invalid platform" }, { status: 400 })
    }

    systemPrompt += `
Return ONLY the posts as a JSON array of strings, with no additional text or explanation.
Format the response as: { "posts": ["post1", "post2", "post3", "post4", "post5"] }`

    // Generate content using AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: `Generate 5 ${platform} posts based on the provided information.`,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse the response
    try {
      const parsedResponse = JSON.parse(text)
      return NextResponse.json(parsedResponse)
    } catch (error) {
      console.error("Error parsing AI response:", error)
      return NextResponse.json({ error: "Failed to parse AI response", posts: [text] }, { status: 500 })
    }
  } catch (error) {
    console.error("Error generating posts:", error)
    return NextResponse.json({ error: "Failed to generate posts" }, { status: 500 })
  }
}