import { NextResponse } from 'next/server'

let centralStore: {
  monks: any[]
  students: any[]
  rooms: any[]
  inventory: any[]
  incomes: any[]
  expenses: any[]
  attendance: Record<string, any>
  lastUpdated: string
} = {
  monks: [],
  students: [],
  rooms: [],
  inventory: [],
  incomes: [],
  expenses: [],
  attendance: {},
  lastUpdated: new Date().toISOString()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const collection = searchParams.get('collection')

  if (collection && collection in centralStore) {
    return NextResponse.json({
      success: true,
      data: (centralStore as any)[collection],
      lastUpdated: centralStore.lastUpdated
    })
  }

  return NextResponse.json({
    success: true,
    data: centralStore,
    lastUpdated: centralStore.lastUpdated
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, collection, data, id } = body

    if (!collection || !(collection in centralStore)) {
      return NextResponse.json({ success: false, error: 'Invalid collection' }, { status: 400 })
    }

    const list = (centralStore as any)[collection] as any[]

    if (action === 'insert' || action === 'add') {
      if (Array.isArray(data)) {
        (centralStore as any)[collection] = [...data, ...list]
      } else if (data) {
        (centralStore as any)[collection] = [data, ...list]
      }
    } else if (action === 'update' || action === 'edit') {
      if (id && data) {
        (centralStore as any)[collection] = list.map(item => item.id === id ? { ...item, ...data, updated_at: new Date().toISOString() } : item)
      }
    } else if (action === 'delete') {
      if (id) {
        (centralStore as any)[collection] = list.filter(item => item.id !== id)
      }
    } else if (action === 'sync_all') {
      if (data) {
        (centralStore as any)[collection] = data
      }
    }

    centralStore.lastUpdated = new Date().toISOString()

    return NextResponse.json({
      success: true,
      message: 'Cloud synchronized successfully',
      data: (centralStore as any)[collection],
      lastUpdated: centralStore.lastUpdated
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
