"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, Server, Cloud } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface GenerateHeadshotsButtonProps {
  orderId: string
  disabled?: boolean
}

interface ClusterStatus {
  spark: { online: boolean }
  ollama: { online: boolean }
  models: string[]
}

export function GenerateHeadshotsButton({ orderId, disabled }: GenerateHeadshotsButtonProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [style, setStyle] = useState("professional")
  const [cluster, setCluster] = useState<ClusterStatus | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch("/api/cluster-status")
      .then((r) => r.json())
      .then((data) => setCluster(data))
      .catch(() => setCluster({ spark: { online: false }, ollama: { online: false }, models: [] }))
      .finally(() => setChecking(false))
  }, [])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const useLocal = cluster?.spark.online ?? false
      const endpoint = useLocal ? "/api/generate-local" : "/api/generate-headshot"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, style }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Failed to generate headshot")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate. Please try again.")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const isLocal = cluster?.spark.online ?? false

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Select value={style} onValueChange={setStyle} disabled={isGenerating || disabled}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="creative">Creative</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleGenerate}
          disabled={disabled || isGenerating || checking}
          size="sm"
          variant={isLocal ? "default" : "outline"}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              {isLocal ? (
                <Server className="mr-2 h-4 w-4" />
              ) : (
                <Cloud className="mr-2 h-4 w-4" />
              )}
              {isLocal ? "Generate Local" : "Generate (Cloud)"}
            </>
          )}
        </Button>
      </div>

      {!checking && (
        <p className="text-xs text-muted-foreground">
          {isLocal
            ? "Spark cluster online — photos processed locally for privacy"
            : "Spark offline — using cloud fallback (fal.ai)"}
        </p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
