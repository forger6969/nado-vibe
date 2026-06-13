declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void
        expand(): void
        close(): void
        initDataUnsafe: {
          user?: { id: number; first_name: string; last_name?: string; username?: string }
        }
        MainButton: {
          text: string
          show(): void
          hide(): void
          onClick(fn: () => void): void
          offClick(fn: () => void): void
          showProgress(leaveActive: boolean): void
          hideProgress(): void
          enable(): void
          disable(): void
        }
        BackButton: {
          show(): void
          hide(): void
          onClick(fn: () => void): void
          offClick(fn: () => void): void
        }
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
          notificationOccurred(type: 'error' | 'success' | 'warning'): void
        }
        colorScheme: 'light' | 'dark'
        themeParams: Record<string, string>
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        version: string
      }
    }
  }
}

export const tg = window.Telegram?.WebApp

export function getTgUser() {
  return tg?.initDataUnsafe?.user ?? null
}

export function initTg() {
  if (!tg) return
  tg.ready()
  tg.expand()
}
