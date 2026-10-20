import { config } from './config.js'

// Render's free plan puts a service to sleep after ~15 minutes without traffic.
// Calling our own public address every 14 minutes (KEEP_ALIVE_MINUTES) keeps it awake.
// (It cannot wake a service that is already asleep, so also add an outside pinger such as UptimeRobot.)

export function startKeepAlive() {
  if (!config.keepAliveUrl) return // local development: nothing to do
  const ping = async () => {
    try {
      const res = await fetch(config.keepAliveUrl, { signal: AbortSignal.timeout(20_000) })
      console.log(`Keep-alive: ${config.keepAliveUrl} -> ${res.status}`)
    } catch (err) {
      console.error('Keep-alive failed:', err.message)
    }
  }
  setInterval(ping, config.keepAliveMinutes * 60 * 1000).unref()
  console.log(`Keep-alive: pinging ${config.keepAliveUrl} every ${config.keepAliveMinutes} minutes`)
}
