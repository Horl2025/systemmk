// Central Cloud Synchronization Helper with Instant Merging, BroadcastChannel & Ultra-Fast Multi-Device Polling

// BroadcastChannel allows instant cross-tab / cross-window sync in 0 milliseconds
const broadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('systemmk_realtime_sync')
  : null

export function subscribeToRealtimeSync(onUpdate: (collection?: string) => void) {
  if (!broadcast) return () => {}
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'DATA_UPDATED') {
      onUpdate(event.data.collection)
    }
  }
  broadcast.addEventListener('message', handler)
  return () => broadcast.removeEventListener('message', handler)
}

export function notifyRealtimeUpdate(collection?: string) {
  if (broadcast) {
    try {
      broadcast.postMessage({ type: 'DATA_UPDATED', collection, timestamp: Date.now() })
    } catch {}
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('systemmk_data_updated', { detail: { collection } }))
  }
}

export async function fetchCloudCollection(collection: string): Promise<any[] | null> {
  try {
    const timestamp = Date.now()
    const res = await fetch(`/api/cloud-sync?collection=${collection}&t=${timestamp}`, { 
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    })
    if (res.ok) {
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        return json.data
      }
    }
  } catch (e) {
    console.error(`Error fetching cloud collection ${collection}:`, e)
  }
  return null
}

export async function syncToCloud(action: 'add' | 'edit' | 'delete' | 'sync_all', collection: string, data?: any, id?: string) {
  try {
    // Notify all tabs and listeners immediately for 0ms UI update
    notifyRealtimeUpdate(collection)

    const res = await fetch('/api/cloud-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, collection, data, id })
    })
    const json = await res.json()
    // Trigger another update on response confirmation
    notifyRealtimeUpdate(collection)
    return json
  } catch (e) {
    console.error(`Error syncing to cloud for ${collection}:`, e)
    return { success: false }
  }
}
