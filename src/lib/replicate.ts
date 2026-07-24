import Replicate from "replicate"

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function generateImage(prompt: string, options?: { model?: string; width?: number; height?: number; negative_prompt?: string; seed?: number; image?: string | null }) {
  const model = options?.model || "black-forest-labs/flux-schnell"
  const input: Record<string, unknown> = { prompt }
  if (options?.width) input.width = options.width
  if (options?.height) input.height = options.height
  if (options?.negative_prompt) input.negative_prompt = options.negative_prompt
  if (options?.seed) input.seed = options.seed
  if (options?.image) input.image = options.image
  return replicate.run(model as `${string}/${string}`, { input })
}

export async function generateVideo(prompt: string, options?: { model?: string; duration?: number; aspect_ratio?: string }) {
  const model = options?.model || "luma/ray"
  const input: Record<string, unknown> = { prompt }
  if (options?.duration) input.duration = options.duration
  if (options?.aspect_ratio) input.aspect_ratio = options.aspect_ratio
  return replicate.run(model as `${string}/${string}`, { input })
}

export async function upscaleImage(imageUrl: string) {
  return replicate.run("nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b", {
    input: { image: imageUrl, scale: 4 },
  })
}

export async function generateVoiceover(text: string) {
  const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
    },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  })
  if (!response.ok) throw new Error("Voiceover generation failed")
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}
