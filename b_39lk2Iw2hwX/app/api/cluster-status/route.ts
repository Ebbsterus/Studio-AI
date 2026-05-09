import { NextResponse } from "next/server"

const COMFYUI_HOST = "192.168.50.195"
const COMFYUI_PORT = 8188
const OLLAMA_HOST = "192.168.50.161"
const OLLAMA_PORT = 11434

export async function GET() {
  const results = {
    spark: { online: false, version: null as string | null },
    ollama: { online: false, version: null as string | null },
    models: [] as string[],
  }

  try {
    const comfyRes = await fetch(`http://${COMFYUI_HOST}:${COMFYUI_PORT}/system_stats`, {
      signal: AbortSignal.timeout(3000),
    })
    if (comfyRes.ok) {
      results.spark.online = true
    }
  } catch {
    // Spark offline
  }

  try {
    const ollamaRes = await fetch(`http://${OLLAMA_HOST}:${OLLAMA_PORT}/api/version`, {
      signal: AbortSignal.timeout(3000),
    })
    if (ollamaRes.ok) {
      results.ollama.online = true
      const data = await ollamaRes.json()
      results.ollama.version = data.version
    }
  } catch {
    // Ollama offline
  }

  try {
    const modelsRes = await fetch(`http://${OLLAMA_HOST}:${OLLAMA_PORT}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    })
    if (modelsRes.ok) {
      const data = await modelsRes.json()
      results.models = data.models?.map((m: { name: string }) => m.name) || []
    }
  } catch {
    // models list unavailable
  }

  return NextResponse.json(results)
}
