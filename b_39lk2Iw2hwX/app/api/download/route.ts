import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

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
    if (!pathname.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const admin = createAdminClient()
    const { data: blob, error } = await admin.storage
      .from("headshots")
      .download(pathname)

    if (error || !blob) {
      return new NextResponse("Not found", { status: 404 })
    }

    const arrayBuffer = await blob.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": blob.type || "image/jpeg",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error downloading file:", error)
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
  }
}
