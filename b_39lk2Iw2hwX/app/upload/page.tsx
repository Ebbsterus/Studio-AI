"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, X, Check, ImageIcon, Loader2 } from "lucide-react"

interface UploadedFile {
  id: string
  file: File
  preview: string
  uploaded?: boolean
  storage_path?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [gender, setGender] = useState<string>("auto")
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith("image/")
    )
    
    addFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
    }
  }, [])

  const addFiles = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
    }))
    setFiles(prev => [...prev, ...uploadedFiles].slice(0, 10))
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const handleSubmit = async () => {
    if (files.length < 5) return
    
    setIsSubmitting(true)
    
    try {
      // Upload each file to Vercel Blob
      const uploadPromises = files.map(async (uploadedFile) => {
        const formData = new FormData()
        formData.append("file", uploadedFile.file)
        formData.append("gender", gender === "auto" ? "" : gender)
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error("Upload failed")
        }
        
        return response.json()
      })
      
      await Promise.all(uploadPromises)
      router.push("/dashboard?upload=success")
    } catch (error) {
      console.error("Upload error:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Upload Your Photos</h1>
          <p className="text-muted-foreground">
            Upload 5-10 photos of yourself for the best results
          </p>
        </div>

        {/* Upload tips */}
        <Card className="mb-8 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Photo Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Clear, well-lit photos of your face</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Different angles and expressions</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Avoid sunglasses and hats</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Recent photos work best</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Drop zone */}
        <Card 
          className={`mb-8 border-2 border-dashed transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mb-2 text-lg font-medium">Drag and drop your photos here</p>
            <p className="mb-4 text-sm text-muted-foreground">or click to browse</p>
            <label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button variant="outline" asChild>
                <span>Select Photos</span>
              </Button>
            </label>
          </CardContent>
        </Card>

        {/* Uploaded files */}
        {files.length > 0 && (
          <Card className="mb-8 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">
                Uploaded Photos ({files.length}/10)
              </CardTitle>
              <CardDescription>
                {files.length < 5 
                  ? `Add ${5 - files.length} more photo${5 - files.length > 1 ? "s" : ""} to continue`
                  : "You can add more photos or proceed to generate"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {files.map((file) => (
                  <div key={file.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={file.preview}
                      alt="Uploaded photo"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {files.length < 10 && (
                  <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary hover:bg-primary/5">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gender selector */}
        {files.length > 0 && (
          <Card className="mb-8 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Photo Settings</CardTitle>
              <CardDescription>
                Help us generate better headshots by selecting your gender
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender" className="w-full sm:w-[240px]">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="other">Other / Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This helps our AI generate headshots with the correct body type and clothing fit.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={files.length < 5 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                Generate Headshots
                {files.length >= 5 && (
                  <span className="ml-2 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
                    {files.length} photos
                  </span>
                )}
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
