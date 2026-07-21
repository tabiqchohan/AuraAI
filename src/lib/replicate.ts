import Replicate from "replicate"

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function generateImage(prompt: string, options?: { model?: string; width?: number; height?: number; negative_prompt?: string; seed?: number }) {
  const model = options?.model || "black-forest-labs/flux-schnell"
  const input: Record<string, unknown> = { prompt }
  if (options?.width) input.width = options.width
  if (options?.height) input.height = options.height
  if (options?.negative_prompt) input.negative_prompt = options.negative_prompt
  if (options?.seed) input.seed = options.seed
  return replicate.run(model as `${string}/${string}`, { input })
}

export async function generateVideo(prompt: string, options?: { model?: string; duration?: number; aspect_ratio?: string }) {
  const model = options?.model || "luma/ray"
  if (model.startsWith("kling")) {
    return generateKlingVideo(prompt, options)
  }
  const input: Record<string, unknown> = { prompt }
  if (options?.duration) input.duration = options.duration
  if (options?.aspect_ratio) input.aspect_ratio = options.aspect_ratio
  return replicate.run(model as `${string}/${string}`, { input })
}

async function getKlingAuth() {
  const apiKey = process.env.KLING_AI_API_KEY
  if (!apiKey) throw new Error("Kling AI API key is required")
  return apiKey
}

async function klingFetch(url: string, options?: RequestInit): Promise<any> {
  const token = await getKlingAuth()
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`Kling AI error: ${await res.text()}`)
  const result = await res.json()
  if (result.code !== 0) throw new Error(`Kling AI error: ${result.message}`)
  return result
}

async function generateKlingVideo(prompt: string, options?: { model?: string; duration?: number; aspect_ratio?: string }) {
  const model = options?.model || "kling-v1.5"
  const duration = options?.duration || 5
  const aspectRatio = options?.aspect_ratio || "16:9"

  const result = await klingFetch("https://api.klingai.com/v1/videos/text2video", {
    method: "POST",
    body: JSON.stringify({
      model_name: model,
      prompt,
      duration,
      aspect_ratio: aspectRatio,
      mode: duration > 10 ? "pro" : "std",
    }),
  })

  const taskId = result.data.task_id
  return pollKlingResult(taskId)
}

async function pollKlingResult(taskId: string): Promise<string> {
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 3000))
    const result = await klingFetch(`https://api.klingai.com/v1/videos/text2video/${taskId}`)
    const task = result.data
    if (task.status === "succeed") return task.video?.url || task.videos?.[0]?.url || ""
    if (task.status === "failed") throw new Error(`Kling AI generation failed: ${task.message || "Unknown error"}`)
  }
  throw new Error("Kling AI generation timed out")
}
