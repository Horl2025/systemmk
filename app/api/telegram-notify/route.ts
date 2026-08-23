import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, botToken, chatId, parseMode = 'HTML' } = body

    const token = (botToken || process.env.TELEGRAM_BOT_TOKEN || '').trim()
    const targetChat = (chatId || process.env.TELEGRAM_CHAT_ID || '').trim()

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message content is required' }, { status: 400 })
    }

    if (!token || !targetChat) {
      return NextResponse.json({ 
        success: false, 
        error: 'សូមបញ្ចូល Telegram Bot Token និង Chat ID នៅក្នុង Settings ជាមុនសិន! (Telegram Bot Token and Chat ID are required)' 
      }, { status: 400 })
    }

    const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`

    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChat,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      })
    })

    const data = await response.json()

    if (data.ok) {
      return NextResponse.json({
        success: true,
        message: 'បានផ្ញើទៅកាន់ Telegram ដោយជោគជ័យ!',
        result: data.result
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.description || 'បរាជ័យក្នុងការផ្ញើទៅកាន់ Telegram'
      }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Server error while sending Telegram message'
    }, { status: 500 })
  }
}
