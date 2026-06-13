const CLOUD = 'dr0z8c9ag'
const PRESET = 'nado_vibe'

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', PRESET)
  form.append('folder', 'nado-vibe')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Cloudinary error: ${err}`)
  }
  const data = await res.json() as { secure_url: string }
  return data.secure_url
}
