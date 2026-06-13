export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Геолокация недоступна')); return }
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
  })
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru`,
    { headers: { 'User-Agent': 'nado-vibe-tma/1.0' } }
  )
  if (!res.ok) throw new Error('Ошибка геокодирования')
  const data = await res.json()
  const a = data.address ?? {}
  const parts = [
    a.road ?? a.pedestrian ?? a.footway ?? a.path,
    a.house_number,
    a.suburb ?? a.neighbourhood,
    a.city ?? a.town ?? a.village,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : (data.display_name ?? '')
}
