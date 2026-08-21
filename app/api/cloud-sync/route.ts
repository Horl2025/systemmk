import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Global in-memory cache to ensure speed across serverless invocations
let memoryStore: any = null

function getFilePath() {
  // In Vercel serverless environment, use os.tmpdir() for write permissions
  return path.join(os.tmpdir(), 'systemmk_cloud_database.json')
}

function getStore() {
  if (memoryStore) return memoryStore

  const filePath = getFilePath()
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      memoryStore = JSON.parse(content)
      return memoryStore
    }
  } catch (e) {
    console.error('Error reading cloud database file:', e)
  }

  memoryStore = {
    monks: [],
    students: [],
    rooms: [],
    inventory: [],
    incomes: [],
    expenses: [],
    attendance: {},
    lastUpdated: new Date().toISOString()
  }
  return memoryStore
}

function saveStore(store: any) {
  try {
    store.lastUpdated = new Date().toISOString()
    memoryStore = store
    const filePath = getFilePath()
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf8')
  } catch (e) {
    console.error('Error writing to cloud database file:', e)
  }
}

export async function GET(request: Request) {
  const store = getStore()
  const { searchParams } = new URL(request.url)
  const collection = searchParams.get('collection')

  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store',
    'Pragma': 'no-cache',
    'Expires': '0',
  }

  if (collection && collection in store) {
    return NextResponse.json({
      success: true,
      data: store[collection],
      lastUpdated: store.lastUpdated
    }, { headers })
  }

  return NextResponse.json({
    success: true,
    data: store,
    lastUpdated: store.lastUpdated
  }, { headers })
}

export async function POST(request: Request) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  }

  try {
    const store = getStore()
    const body = await request.json()
    const { action, collection, data, id } = body

    if (!collection || !(collection in store)) {
      return NextResponse.json({ success: false, error: 'Invalid collection' }, { status: 400, headers })
    }

    const list = (store[collection] as any[]) || []

    if (action === 'insert' || action === 'add') {
      if (Array.isArray(data)) {
        const map = new Map()
        list.forEach((item: any) => { if (item?.id) map.set(item.id, item) })
        data.forEach((item: any) => { if (item?.id) map.set(item.id, item) })
        store[collection] = Array.from(map.values())
      } else if (data && data.id) {
        const filtered = list.filter((item: any) => item.id !== data.id)
        store[collection] = [data, ...filtered]
      }
    } else if (action === 'update' || action === 'edit') {
      if (id && data) {
        store[collection] = list.map(item => item.id === id ? { ...item, ...data, updated_at: new Date().toISOString() } : item)
      }
    } else if (action === 'delete') {
      if (id) {
        store[collection] = list.filter(item => item.id !== id)
      }
    } else if (action === 'sync_all') {
      if (Array.isArray(data)) {
        const map = new Map()
        // Put existing cloud data
        list.forEach((item: any) => { if (item && item.id) map.set(item.id, item) })
        // Merge incoming data
        data.forEach((item: any) => { if (item && item.id) map.set(item.id, item) })
        store[collection] = Array.from(map.values())
      }
    }

    saveStore(store)

    return NextResponse.json({
      success: true,
      message: 'Cloud synchronized successfully',
      data: store[collection],
      lastUpdated: store.lastUpdated
    }, { headers })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers })
  }
}
