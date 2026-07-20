"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { MessageSquare, Star, Send, Loader2 } from "lucide-react"

export default function FeedbackPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [rating, setRating] = useState(0)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error("Please enter your feedback")
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, rating }),
      })
      if (!res.ok) throw new Error("Failed to submit")
      toast.success("Thank you for your feedback!")
      setName(""); setEmail(""); setMessage(""); setRating(0)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <section className="pt-24 pb-16 px-4 bg-black">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Send Feedback</h1>
            <p className="text-zinc-400 text-lg">Help us improve AuraAI. We value your opinion.</p>
          </div>

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-zinc-100">Your Feedback</CardTitle>
              <CardDescription className="text-zinc-400">
                Tell us what you love or what we can improve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fb-name" className="text-zinc-300">Name (optional)</Label>
                  <Input
                    id="fb-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-email" className="text-zinc-300">Email (optional)</Label>
                  <Input
                    id="fb-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-colors"
                      >
                        <Star
                          className={`w-6 h-6 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-message" className="text-zinc-300">Message</Label>
                  <Textarea
                    id="fb-message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts, suggestions, or report an issue..."
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={sending}>
                  {sending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}