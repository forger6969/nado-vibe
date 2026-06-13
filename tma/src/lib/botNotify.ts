const BASE = (import.meta.env.VITE_BOT_NOTIFY_URL as string | undefined)
  ?.replace('/notify_order', '') ?? ''
const SECRET = import.meta.env.VITE_NOTIFY_SECRET as string | undefined

function headers() {
  return {
    'Content-Type': 'application/json',
    ...(SECRET ? { 'X-Notify-Secret': SECRET } : {}),
  }
}

export async function notifyAdmin(order: Record<string, unknown>): Promise<void> {
  if (!BASE) return
  try {
    await fetch(`${BASE}/notify_order`, { method: 'POST', headers: headers(), body: JSON.stringify(order) })
  } catch { /* best-effort */ }
}

export async function notifyClient(
  tgId: number,
  text: string,
  webappButton?: { label: string; url: string },
): Promise<void> {
  if (!BASE) return
  try {
    await fetch(`${BASE}/notify_client`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ tg_id: tgId, text, webapp_button: webappButton }),
    })
  } catch { /* best-effort */ }
}
