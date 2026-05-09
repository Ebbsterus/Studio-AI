import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const orderId = formData.get("orderId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const filename = `uploads/${user.id}/${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
      access: "private",
    })

    // Save to database
    const { data: upload, error: dbError } = await supabase
      .from("photo_uploads")
      .insert({
        user_id: user.id,
        order_id: orderId || null,
        file_path: blob.pathname,
        status: "uploaded",
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save upload" }, { status: 500 })
    }

    return NextResponse.json({
      id: upload.id,
      pathname: blob.pathname,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
