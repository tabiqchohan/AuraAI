import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateImage, generateVideo } from "@/lib/replicate"
import { CREDITS_PER_GENERATION } from "@/lib/constants"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, type, model, width, height, negative_prompt, seed, batch_count, duration, aspect_ratio } = body

    if (!prompt || !type) {
      return NextResponse.json({ error: "Missing required fields: prompt, type" }, { status: 400 })
    }

    if (type !== "image" && type !== "video") {
      return NextResponse.json({ error: "Type must be 'image' or 'video'" }, { status: 400 })
    }

    const batchSize = Math.min(Math.max(batch_count || 1, 1), 4)
    const creditsPerGen = CREDITS_PER_GENERATION[type as keyof typeof CREDITS_PER_GENERATION] || 5
    const totalCreditsNeeded = creditsPerGen * batchSize

    const { data: profile } = await supabase
      .from("users")
      .select("credits, total_generations")
      .eq("id", user.id)
      .single()

    if (!profile || profile.credits < totalCreditsNeeded) {
      return NextResponse.json(
        { error: "Insufficient credits", available: profile?.credits || 0, required: totalCreditsNeeded },
        { status: 402 }
      )
    }

    const adminClient = createAdminClient()
    const generationIds: string[] = []

    const { error: deductError } = await adminClient.rpc("deduct_credits", {
      user_id: user.id,
      amount: totalCreditsNeeded,
    })

    if (deductError) {
      return NextResponse.json({ error: "Failed to deduct credits" }, { status: 500 })
    }

    await adminClient
      .from("users")
      .update({ total_generations: (profile.total_generations || 0) + batchSize })
      .eq("id", user.id)

    for (let i = 0; i < batchSize; i++) {
      const generationId = uuidv4()

      await supabase.from("generations").insert({
        id: generationId,
        user_id: user.id,
        prompt,
        negative_prompt: negative_prompt || null,
        type,
        model: model || (type === "image" ? "black-forest-labs/flux-schnell" : "luma/ray"),
        status: "pending",
        width: width || null,
        height: height || null,
        seed: seed || null,
        credits_used: creditsPerGen,
        is_public: true,
        likes_count: 0,
        output_url: "",
        output_urls: [],
      })

      generationIds.push(generationId)

      const handleOutput = async (output: unknown) => {
        const urls = Array.isArray(output) ? output : [String(output)]
        await supabase
          .from("generations")
          .update({ status: "completed", output_url: urls[0], output_urls: urls })
          .eq("id", generationId)
      }

      const handleError = async () => {
        await supabase
          .from("generations")
          .update({ status: "failed" })
          .eq("id", generationId)
      }

      if (type === "image") {
        generateImage(prompt, { model, width, height, negative_prompt, seed })
          .then(handleOutput)
          .catch(handleError)
      } else {
        generateVideo(prompt, { model, duration, aspect_ratio })
          .then(handleOutput)
          .catch(handleError)
      }
    }

    return NextResponse.json({
      generationIds,
      creditsUsed: totalCreditsNeeded,
      creditsRemaining: profile.credits - totalCreditsNeeded,
    })
  } catch (error) {
    console.error("Generate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
