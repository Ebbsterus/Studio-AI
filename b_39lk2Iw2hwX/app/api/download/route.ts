import { type NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pathname = request.nextUrl.searchParams.get("pathname")
    const filename = request.nextUrl.searchParams.get("filename") || "headshot.jpg"

    if (!pathname) {
      return NextResponse.json({ error: "Missing pathname" }, { status: 400 })
    }

    // Verify user owns this file
    if (!pathname.includes(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await get(pathname, {
      access: "private",
    })

    if (!result) {
      return new NextResponse("Not found", { status: 404 })
    }

    // Return with Content-Disposition header for download
    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error downloading file:", error)
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
  }
}
