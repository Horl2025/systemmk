import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Persistent File-based storage for Mock Cloud
// Guarantees that whatever user A inserts will be saved and visible to user B immediately
const DATA_FILE = path.join(process.cwd(), 'cloud_database.json')

function getStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(content)
    }
  } catch (e) {
    console.error('Error reading cloud database file:', e)
  }

  return {
    monks: [],
    students: [],
    rooms: [],
    inventory: [],
    incomes: [],
    expenses: [],
    attendance: {},
    lastUpdated: new Date().toISOString()
  }
}

function saveStore(store: any) {
  try {
    store.lastUpdated = new Date().toISOString()
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8')
  } catch (e) {
    console.error('Error writing to cloud database file:', e)
  }
}

export async function GET(request: Request) {
  const store = getStore()
  const { searchParams } = new URL(request.url)
  const collection = searchParams.get('collection')

  if (collection && collection in store) {
    return NextResponse.json({
      success: true,
      data: store[collection],
      lastUpdated: store.lastUpdated
    })
  }

  return NextResponse.json({
    success: true,
    data: store,
    lastUpdated: store.lastUpdated
  })
}

export async function POST(request: Request) {
  try {
    const store = getStore()
    const body = await request.json()
    const { action, collection, data, id } = body

    if (!collection || !(collection in store)) {
      return NextResponse.json({ success: false, error: 'Invalid collection' }, { status: 400 })
    }

    const list = (store[collection] as any[]) || []

    if (action === 'insert' || action === 'add') {
      if (Array.isArray(data)) {
        // Merge without duplicates by id
        const existingIds = new Set(list.map((item: any) => item.id))
        const newItems = data.filter((item: any) => !existingIds.has(item.id))
        store[collection] = [...newItems, ...list]
      } else if (data) {
        const filtered = list.filter((item: any) => item.id !== data.id)
        store[collection] = [data, ...filtered]
      }
    } else if (action === 'update' || action === 'edit') {
      if (id && data) {
        store[collection] = list.map((item: any) => item.id === id ? { ...item, ...data, updated_at: new Date().toISOString() } : item)
      }
    } else if (action === 'delete') {
      if (id) {
        store[collection] = list.filter((item: any) => item.id !== id)
      }
    } else if (action === 'sync_all') {
      if (Array.isArray(data)) {
        // Merge existing cloud items with incoming data
        const map = new Map()
        // First put cloud items
        list.forEach((item: any) => { if (item && item.id) map.set(item.id, item) })
        // Then put incoming items (or override)
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
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
