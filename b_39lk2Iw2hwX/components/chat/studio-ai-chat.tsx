"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Loader2 } from "lucide-react"

interface Message {
  role: "user" | "bot"
  text: string
  isTyping?: boolean
}

export function StudioAIChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! I can help with questions about our AI headshot service — pricing, how it works, or what photos to upload. What would you like to know?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput("")
    setLoading(true)
    setMessages((prev) => [...prev, { role: "user", text }, { role: "bot", text: "Typing...", isTyping: true }])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) {
        throw new Error("Service unavailable")
      }

      const data = await res.json()
      const reply = data.message?.content || "Sorry, I didn't understand that."

      setMessages((prev) => {
        const next = prev.slice(0, -1)
        next.push({ role: "bot", text: reply })
        return next
      })
    } catch {
      setMessages((prev) => {
        const next = prev.slice(0, -1)
        next.push({
          role: "bot",
          text: "Sorry, couldn't reach the model. Is Ollama running on your network?",
        })
        return next
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage()
  }

  return (
    <>
      {/* Chat bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-label="Chat with Studio AI"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-amber-500 px-4 py-3 text-sm font-bold text-black">
            <span>Studio AI Assistant</span>
            <button onClick={() => setOpen(false)} className="text-black/70 hover:text-black" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex h-[380px] flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "self-end bg-amber-500 text-black"
                    : "self-start bg-zinc-800 text-zinc-100"
                } ${msg.isTyping ? "italic text-zinc-400" : ""}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-zinc-800 p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              maxLength={300}
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              size="sm"
              className="bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
