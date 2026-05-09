import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { head } from "@vercel/blob"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import os from "os"

const execAsync = promisify(exec)

const COMFYUI_HOST = "192.168.50.195"
const COMFYUI_PORT = 8188
const SPARK_USER = "ebbsterus"
const SSH_KEY = process.env.SSH_KEY_PATH || "C:\\Users\\Ebrahim Hoosien\\AppData\\Local\\NVIDIA Corporation\\Sync\\config\\nvsync.key"
const SPARK_INPUT_DIR = "/home/ebbsterus/ComfyUI/input"
const SPARK_OUTPUT_DIR = "/home/ebbsterus/ComfyUI/output"

const STYLE_PROMPTS: Record<string, string> = {
  professional:
    "professional corporate headshot, studio lighting, neutral gray background, sharp focus, business attire, confident expression, photorealistic, 8k quality",
  creative:
    "creative professional headshot, artistic lighting, modern background, stylish appearance, confident pose, photorealistic, high quality portrait",
  casual:
    "casual professional headshot, natural lighting, soft background blur, approachable expression, smart casual attire, warm tones, photorealistic",
}

async function scpToSpark(localPath: string, remoteFilename: string) {
  const remotePath = `${SPARK_USER}@${COMFYUI_HOST}:${SPARK_INPUT_DIR}/${remoteFilename}`
  const cmd = `scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${localPath}" "${remotePath}"`
  const { stderr } = await execAsync(cmd)
  if (stderr && !stderr.includes("100%")) {
    console.warn("SCP stderr:", stderr)
  }
}

async function scpFromSpark(remoteFilename: string, localPath: string) {
  const remotePath = `${SPARK_USER}@${COMFYUI_HOST}:${SPARK_OUTPUT_DIR}/${remoteFilename}`
  const cmd = `scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${remotePath}" "${localPath}"`
  const { stderr } = await execAsync(cmd)
  if (stderr && !stderr.includes("100%")) {
    console.warn("SCP stderr:", stderr)
  }
}

async function submitWorkflow(workflow: object) {
  const res = await fetch(`http://${COMFYUI_HOST}:${COMFYUI_PORT}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow }),
  })
  if (!res.ok) {
    throw new Error(`ComfyUI submit failed: ${res.status}`)
  }
  return (await res.json()) as { prompt_id: string; number: number }
}

async function pollHistory(promptId: string, timeoutMs = 300000, intervalMs = 5000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`http://${COMFYUI_HOST}:${COMFYUI_PORT}/history/${promptId}`)
    if (res.ok) {
      const data = await res.json()
      if (data[promptId]) {
        return data[promptId] as {
          status: { completed: boolean; messages?: string[] }
          outputs: Record<string, { images?: { filename: string; subfolder: string; type: string }[] }>
        }
      }
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  throw new Error("ComfyUI render timed out")
}

export async function POST(request: NextRequest) {
  const tempFiles: string[] = []

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
      .order("created_at", { ascending: false })

    if (!uploads || uploads.length === 0) {
      return NextResponse.json(
        { error: "No photos uploaded for this order" },
        { status: 400 }
      )
    }

    // Use the most recent upload
    const bestPhoto = uploads[0]

    // Download photo from Vercel Blob to temp file
    const blobInfo = await head(bestPhoto.file_path)
    const photoRes = await fetch(blobInfo.url)
    if (!photoRes.ok) {
      throw new Error("Failed to download photo from storage")
    }
    const photoBuffer = Buffer.from(await photoRes.arrayBuffer())
    const photoExt = path.extname(bestPhoto.file_path) || ".png"
    const localPhotoName = `studioai_${user.id}_${orderId}${photoExt}`
    const localPhotoPath = path.join(os.tmpdir(), localPhotoName)
    fs.writeFileSync(localPhotoPath, photoBuffer)
    tempFiles.push(localPhotoPath)

    // SCP photo to Spark
    await scpToSpark(localPhotoPath, localPhotoName)

    // Load and prepare workflow
    const workflowPath = path.join(process.cwd(), "resources", "workflows", "headshot-reactor.json")
    const workflowTemplate = JSON.parse(fs.readFileSync(workflowPath, "utf-8"))

    // Inject prompt
    const prompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.professional
    workflowTemplate["2"].inputs.text = prompt

    // Inject user photo filename
    workflowTemplate["7"].inputs.image = localPhotoName

    // Randomize seed
    workflowTemplate["5"].inputs.seed = Math.floor(Math.random() * 2147483647)

    // Submit to ComfyUI
    const { prompt_id: promptId } = await submitWorkflow(workflowTemplate)

    // Poll for completion
    const history = await pollHistory(promptId)

    // Extract output filename
    const outputNode = history.outputs["9"]
    if (!outputNode?.images?.[0]?.filename) {
      throw new Error("No output image from ComfyUI")
    }
    const outputFilename = outputNode.images[0].filename

    // Download result from Spark
    const localOutputPath = path.join(os.tmpdir(), outputFilename)
    await scpFromSpark(outputFilename, localOutputPath)
    tempFiles.push(localOutputPath)

    // Upload result to Vercel Blob
    const outputBlobName = `headshots/${user.id}/${orderId}/${Date.now()}-${style}.png`
    const outputBuffer = fs.readFileSync(localOutputPath)
    const { put } = await import("@vercel/blob")
    const outputBlob = await put(outputBlobName, outputBuffer, {
      access: "private",
      contentType: "image/png",
    })

    // Save to database
    const { data: headshot, error: headshotError } = await supabase
      .from("headshots")
      .insert({
        user_id: user.id,
        order_id: orderId,
        image_url: outputBlob.pathname,
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
      pathname: outputBlob.pathname,
      promptId,
      style,
    })
  } catch (error) {
    console.error("Local generation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate headshot locally" },
      { status: 500 }
    )
  } finally {
    // Clean up temp files
    for (const f of tempFiles) {
      try {
        if (fs.existsSync(f)) fs.unlinkSync(f)
      } catch {
        // ignore cleanup errors
      }
    }
  }
}
