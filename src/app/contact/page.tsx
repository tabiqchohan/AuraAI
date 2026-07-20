"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mail, MessageSquare, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ContactPage() {
  return (
    <>
      <section className="pt-24 pb-16 px-4 bg-black">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-zinc-400 text-lg">Have a question or need help? We are here for you.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-12">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/10 mb-4">
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">Email</h3>
              <p className="text-zinc-400">support@auraai.com</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/10 mb-4">
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5a2 2 0 012-2z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">Phone</h3>
              <p className="text-zinc-400">+1 (555) 123-4567</p>
            </div>
          </div>

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-zinc-100">Send us a message</CardTitle>
              <CardDescription className="text-zinc-400">We will get back to you within 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">Name</Label>
                  <Input id="name" placeholder="Your name" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-zinc-300">Message</Label>
                  <Textarea id="message" rows={5} placeholder="How can we help you?" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}