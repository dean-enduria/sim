/**
 * Sim Telemetry - Client-side Instrumentation
 * Stubbed out - telemetry API route has been removed.
 */

if (typeof window !== 'undefined') {
  ;(window as any).__SIM_TELEMETRY_ENABLED = false
  ;(window as any).__SIM_TRACK_EVENT = (_eventName: string, _properties?: any) => {
    // No-op: telemetry is disabled
  }
}
