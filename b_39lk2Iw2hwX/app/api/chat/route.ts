import { type NextRequest, NextResponse } from "next/server"

const rawHost = process.env.OLLAMA_HOST || "192.168.50.161"
const OLLAMA_HOST = rawHost.includes(":") ? rawHost.split(":")[0] : rawHost
const OLLAMA_PORT = process.env.OLLAMA_PORT || "11434"
const MODEL = process.env.OLLAMA_MODEL || "studio-ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`http://${OLLAMA_HOST}:${OLLAMA_PORT}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: body.messages || [{ role: "user", content: body.message }],
        stream: false,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("Ollama error:", errText)
      return NextResponse.json(
        { error: "Chatbot service unavailable. Is Ollama running?" },
        { status: 502 }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Chat proxy error:", error)
    return NextResponse.json(
      { error: "Failed to reach chatbot service" },
      { status: 500 }
    )
  }
}
