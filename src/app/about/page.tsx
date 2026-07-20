import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Sparkles, Image, Video, Users, Globe, Shield } from "lucide-react"

const highlights = [
  { icon: Image, label: "AI Images", value: "10K+" },
  { icon: Video, label: "AI Videos", value: "5K+" },
  { icon: Users, label: "Creators", value: "1K+" },
  { icon: Globe, label: "Countries", value: "50+" },
]

const values = [
  {
    title: "Cutting-Edge AI",
    description: "We use the latest AI models like Flux, Stable Diffusion, and Luma Ray to deliver the best quality generations.",
  },
  {
    title: "User Privacy First",
    description: "Your data and creations are encrypted and private. We never share your content without explicit permission.",
  },
  {
    title: "Continuous Innovation",
    description: "We constantly update our platform with the latest AI advancements to give you the best creative tools.",
  },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black">
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1),transparent_60%)]" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AuraAI
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              We are on a mission to democratize AI-powered creativity. AuraAI makes it easy for anyone to generate stunning images and videos from simple text prompts.
            </p>
          </div>
        </section>

        <section className="py-16 border-t border-zinc-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {highlights.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{item.value}</div>
                    <div className="text-sm text-zinc-500">{item.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-zinc-800">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value) => (
                <div key={value.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">{value.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}