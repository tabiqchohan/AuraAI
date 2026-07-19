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

export async function generateVideo(prompt: string, options?: { model?: string }) {
  const model = options?.model || "luma/ray"
  return replicate.run(model as `${string}/${string}`, { input: { prompt } })
}
