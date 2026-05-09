import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"
import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, style = "professional" } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 })
    }

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get uploaded photos for this order
    const { data: uploads } = await supabase
      .from("photo_uploads")
      .select("*")
      .eq("order_id", orderId)
      .eq("user_id", user.id)

    if (!uploads || uploads.length === 0) {
      return NextResponse.json(
        { error: "No photos uploaded for this order" },
        { status: 400 }
      )
    }

    // Style prompts for different headshot types
    const stylePrompts: Record<string, string> = {
      professional:
        "Professional corporate headshot, studio lighting, neutral gray background, sharp focus, business attire, confident expression, high-end photography",
      creative:
        "Creative professional headshot, artistic lighting, modern background, stylish appearance, confident pose, high-quality portrait",
      casual:
        "Relaxed professional headshot, natural lighting, soft background blur, approachable expression, smart casual attire, warm tones",
    }

    const prompt = stylePrompts[style] || stylePrompts.professional

    // Generate headshot using fal.ai
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: `${prompt}, portrait of a person, photorealistic, 8k quality`,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
      },
    }) as { images?: { url: string }[] }

    const generatedImageUrl = result.images?.[0]?.url

    if (!generatedImageUrl) {
      throw new Error("No image generated")
    }

    // Download and store in Vercel Blob
    const imageResponse = await fetch(generatedImageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const filename = `headshots/${user.id}/${orderId}/${Date.now()}.jpg`

    const blob = await put(filename, imageBuffer, {
      access: "private",
      contentType: "image/jpeg",
    })

    // Save headshot to database
    const { data: headshot, error: headshotError } = await supabase
      .from("headshots")
      .insert({
        user_id: user.id,
        order_id: orderId,
        image_url: blob.pathname,
        status: "completed",
      })
      .select()
      .single()

    if (headshotError) {
      console.error("Database error:", headshotError)
      return NextResponse.json({ error: "Failed to save headshot" }, { status: 500 })
    }

    return NextResponse.json({
      id: headshot.id,
      pathname: blob.pathname,
    })
  } catch (error) {
    console.error("Error generating headshot:", error)
    return NextResponse.json(
      { error: "Failed to generate headshot" },
      { status: 500 }
    )
  }
}
