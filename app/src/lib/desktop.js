// window.desktop is provided by electron/preload.cjs.
// In a normal browser (UI preview with `npm run dev:web`) we use this harmless fallback.
const browserFallback = {
  askCamera: async () => true,
  startLockdown: async () => document.documentElement.requestFullscreen?.().catch(() => {}),
  stopLockdown: async () => document.fullscreenElement && document.exitFullscreen?.(),
  quit: async () => window.close(),
  onViolation: () => () => {},
}

export const desktop = window.desktop ?? browserFallback
