import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "png"
    const fileName = `${user.id}/${uuidv4()}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from("uploads")
      .getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl, path: data.path })
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}