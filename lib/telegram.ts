// Telegram Bot Notification Helper for SystemMK

export interface TelegramConfig {
  botToken: string
  chatId: string
}

export function getTelegramConfig(): TelegramConfig {
  if (typeof window === 'undefined') {
    return { botToken: '', chatId: '' }
  }
  try {
    const token = localStorage.getItem('systemmk_telegram_bot_token') || ''
    const chat = localStorage.getItem('systemmk_telegram_chat_id') || ''
    return { botToken: token, chatId: chat }
  } catch {
    return { botToken: '', chatId: '' }
  }
}

export function saveTelegramConfig(config: TelegramConfig) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('systemmk_telegram_bot_token', config.botToken.trim())
    localStorage.setItem('systemmk_telegram_chat_id', config.chatId.trim())
  } catch {}
}

export async function sendTelegramReport(messageHtml: string, customConfig?: Partial<TelegramConfig>): Promise<{ success: boolean; message: string }> {
  try {
    const config = getTelegramConfig()
    const botToken = customConfig?.botToken || config.botToken
    const chatId = customConfig?.chatId || config.chatId

    if (!botToken || !chatId) {
      return {
        success: false,
        message: 'សូមកំណត់ Telegram Bot Token និង Chat ID នៅក្នុង Settings ជាមុនសិន!'
      }
    }

    const res = await fetch('/api/telegram-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: messageHtml,
        botToken,
        chatId,
        parseMode: 'HTML'
      })
    })

    const data = await res.json()
    return {
      success: data.success,
      message: data.message || data.error || 'បរាជ័យក្នុងការផ្ញើ'
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'កំហុសបណ្តាញ Network'
    }
  }
}
