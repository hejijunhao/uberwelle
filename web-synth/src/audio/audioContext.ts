let audioCtx: AudioContext | null = null

// Support older iOS Safari versions that use webkitAudioContext
const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContextClass()
  }
  return audioCtx
}

export function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    return ctx.resume()
  }
  return Promise.resolve()
}
