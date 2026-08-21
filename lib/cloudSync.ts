// Utility for Synchronizing Data between Clients and Central Cloud Server

export async function fetchCloudCollection(collection: string): Promise<any[] | null> {
  try {
    const res = await fetch(`/api/cloud-sync?collection=${collection}`, { cache: 'no-store' })
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
    const res = await fetch('/api/cloud-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, collection, data, id })
    })
    return await res.json()
  } catch (e) {
    console.error(`Error syncing to cloud for ${collection}:`, e)
    return { success: false }
  }
}
