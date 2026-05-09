import { Upload, Sparkles, Download } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload Your Photos",
    description: "Upload 5-10 photos of yourself. Selfies, casual shots, or any photos where your face is clearly visible.",
  },
  {
    icon: Sparkles,
    title: "AI Enhancement",
    description: "Our AI analyzes your photos and generates stunning professional headshots in various styles and backgrounds.",
  },
  {
    icon: Download,
    title: "Download & Use",
    description: "Download your high-resolution headshots and use them on LinkedIn, resumes, websites, and more.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-border/50 bg-card/30 py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Get professional headshots in three simple steps. No photography experience required.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Step number connector */}
              {index < steps.length - 1 && (
                <div className="absolute left-[calc(50%+40px)] top-10 hidden h-0.5 w-[calc(100%-80px)] bg-border md:block" />
              )}
              
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card">
                <step.icon className="h-8 w-8 text-primary" />
                <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </div>
              </div>
              
              <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
