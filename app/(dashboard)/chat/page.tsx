'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Send, Mic, MicOff, Paperclip, Image as ImageIcon, Video, FileText,
  Smile, Phone, Video as VideoCallIcon, Search, CheckCheck,
  Play, Pause, Download, ArrowLeft, Users, Shield, Hash,
  PhoneOff, Sparkles
} from 'lucide-react'

interface MessageItem {
  id: string
  sender_name: string
  sender_role?: string
  content?: string
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker'
  media_url?: string
  file_name?: string
  file_size?: string
  audio_duration?: string
  sticker_emoji?: string
  created_at: string
  is_self?: boolean
}

const STICKER_PACK = [
  '🙏', '🌸', '🪷', '☸️', '🕯️', '📿', '✨', '🕊️', 
  '😊', '👍', '❤️', '🙌', '🎉', '🌟', '📖', '🍵'
]

const CHANNELS = [
  { id: 'general', name: 'បន្ទប់ទូទៅ (General Chat)', en: 'General Pagoda Chat', icon: Hash, count: '3', online: 8, color: '#D97706', desc: 'ដំណឹងទូទៅ និងការប្រាស្រ័យទាក់ទងរួម' },
  { id: 'monks', name: 'ក្រុមព្រះសង្ឃ (Sangha Group)', en: 'Monks Sangha', icon: Users, count: '12', online: 12, color: '#2563EB', desc: 'សង្ឃកិច្ច វត្តមាន និងកាលវិភាគសិក្សា' },
  { id: 'management', name: 'គណៈកម្មការវត្ត (Council)', en: 'Admin Council', icon: Shield, count: '5', online: 4, color: '#7C3AED', desc: 'កិច្ចការគ្រប់គ្រង និងហិរញ្ញវត្ថុវត្ត' },
]

export default function TelegramChatPage() {
  const router = useRouter()
  const { user, customAvatar } = useAuth()
  const [currentChannel, setCurrentChannel] = useState('general')
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [inputText, setInputText] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const [activeCall, setActiveCall] = useState<'voice' | 'video' | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const [callMuted, setCallMuted] = useState(false)
  const [callVideoOff, setCallVideoOff] = useState(false)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`systemmk_chat_${currentChannel}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setMessages(parsed)
      } else {
        setMessages([])
      }
    } catch {}
  }, [currentChannel])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    let interval: any
    if (isRecording) {
      interval = setInterval(() => setRecordTime(t => t + 1), 1000)
    } else {
      setRecordTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  useEffect(() => {
    let interval: any
    if (activeCall) {
      interval = setInterval(() => setCallDuration(d => d + 1), 1000)
    } else {
      setCallDuration(0)
    }
    return () => clearInterval(interval)
  }, [activeCall])

  const saveMessage = (msg: MessageItem) => {
    setMessages(prev => {
      const updated = [...prev, msg]
      try {
        localStorage.setItem(`systemmk_chat_${currentChannel}`, JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim()) return

    const newMsg: MessageItem = {
      id: Date.now().toString(),
      sender_name: user?.full_name || 'ខ្ញុំករុណា',
      sender_role: user?.role || 'user',
      content: inputText.trim(),
      type: 'text',
      created_at: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }),
      is_self: true,
    }

    saveMessage(newMsg)
    setInputText('')
    setShowStickerPicker(false)
    setShowAttachMenu(false)
  }

  const handleSendSticker = (emoji: string) => {
    const newMsg: MessageItem = {
      id: Date.now().toString(),
      sender_name: user?.full_name || 'ខ្ញុំករុណា',
      sender_role: user?.role || 'user',
      type: 'sticker',
      sticker_emoji: emoji,
      created_at: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }),
      is_self: true,
    }
    saveMessage(newMsg)
    setShowStickerPicker(false)
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          const newMsg: MessageItem = {
            id: Date.now().toString(),
            sender_name: user?.full_name || 'ខ្ញុំករុណា',
            sender_role: user?.role || 'user',
            type: 'image',
            media_url: reader.result as string,
            file_name: file.name,
            created_at: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }),
            is_self: true,
          }
          saveMessage(newMsg)
        }
      }
      reader.readAsDataURL(file)
    }
    setShowAttachMenu(false)
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          const newMsg: MessageItem = {
            id: Date.now().toString(),
            sender_name: user?.full_name || 'ខ្ញុំករុណា',
            sender_role: user?.role || 'user',
            type: 'video',
            media_url: reader.result as string,
            file_name: file.name,
            created_at: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }),
            is_self: true,
          }
          saveMessage(newMsg)
        }
      }
      reader.readAsDataURL(file)
    }
    setShowAttachMenu(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB'
          const newMsg: MessageItem = {
            id: Date.now().toString(),
            sender_name: user?.full_name || 'ខ្ញុំករុណា',
            sender_role: user?.role || 'user',
            type: 'file',
            media_url: reader.result as string,
            file_name: file.name,
            file_size: sizeStr,
            created_at: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }),
            is_self: true,
          }
          saveMessage(newMsg)
        }
      }
      reader.readAsDataURL(file)
    }
    setShowAttachMenu(false)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          if (reader.result) {
            const mins = Math.floor(recordTime / 60)
            const secs = recordTime % 60
            const durStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`

            const newMsg: MessageItem = {
              id: Date.now().toString(),
              sender_name: user?.full_name || 'ខ្ញុំករុណា',
              sender_role: user?.role || 'user',
              type: 'audio',
              media_url: reader.result as string,
              audio_duration: durStr || '0:05',
              created_at: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }),
              is_self: true,
            }
            saveMessage(newMsg)
          }
        }
        reader.readAsDataURL(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch {
      setIsRecording(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    } else if (isRecording) {
      const newMsg: MessageItem = {
        id: Date.now().toString(),
        sender_name: user?.full_name || 'ខ្ញុំករុណា',
        sender_role: user?.role || 'user',
        type: 'audio',
        audio_duration: `0:0${Math.max(recordTime, 3)}`,
        created_at: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }),
        is_self: true,
      }
      saveMessage(newMsg)
    }
    setIsRecording(false)
  }

  const activeCh = CHANNELS.find(c => c.id === currentChannel) || CHANNELS[0]

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="animate-fadeIn space-y-3" style={{ paddingBottom: 'var(--space-6)' }}>
      <input type="file" ref={photoInputRef} accept="image/*" style={{ display: 'none' }} onChange={handlePhotoSelect} />
      <input type="file" ref={videoInputRef} accept="video/*" style={{ display: 'none' }} onChange={handleVideoSelect} />
      <input type="file" ref={fileInputRef} accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" style={{ display: 'none' }} onChange={handleFileSelect} />

      <div className="md:hidden flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {CHANNELS.map(ch => {
          const Icon = ch.icon
          const active = currentChannel === ch.id
          return (
            <button
              key={ch.id}
              onClick={() => setCurrentChannel(ch.id)}
              className="hover-lift"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '16px',
                border: active ? 'none' : '1.5px solid #E2E8F0',
                background: active ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : '#FFFFFF',
                color: active ? '#FFFFFF' : '#475569',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: active ? '0 4px 14px rgba(37, 99, 235, 0.35)' : '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <Icon size={15} />
              <span>{ch.name.split(' (')[0]}</span>
            </button>
          )
        })}
      </div>

      <div 
        style={{ 
          background: '#FFFFFF', 
          borderRadius: '26px', 
          border: '1.5px solid #E2E8F0', 
          boxShadow: '0 16px 40px -10px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(0,0,0,0.02)',
          height: 'calc(100vh - 245px)', 
          minHeight: '480px',
          display: 'flex', 
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div 
          className="hidden md:flex" 
          style={{ 
            width: '320px', 
            borderRight: '1.5px solid #F1F5F9', 
            flexDirection: 'column',
            background: '#F8FAFC'
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1.5px solid #F1F5F9' }}>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '14px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={16} color="#94A3B8" />
              <input 
                placeholder="ស្វែងរកសារ ឬក្រុមសន្ទនា..." 
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.82rem', fontWeight: 600 }} 
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', padding: '0 10px 6px', display: 'block' }}>
              💬 បន្ទប់សន្ទនាផ្ទៃក្នុងវត្ត
            </span>
            {CHANNELS.map(ch => {
              const Icon = ch.icon
              const active = currentChannel === ch.id
              return (
                <div
                  key={ch.id}
                  onClick={() => setCurrentChannel(ch.id)}
                  className="hover-lift"
                  style={{
                    padding: '12px 14px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    background: active ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : '#FFFFFF',
                    color: active ? '#FFFFFF' : '#0F172A',
                    marginBottom: '8px',
                    boxShadow: active ? '0 8px 20px rgba(37, 99, 235, 0.35)' : '0 2px 6px rgba(0,0,0,0.02)',
                    border: active ? 'none' : '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div 
                    style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '14px', 
                      background: active ? 'rgba(255,255,255,0.2)' : `${ch.color}15`, 
                      color: active ? '#FFFFFF' : ch.color, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ch.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: active ? '#DBEAFE' : '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {ch.desc}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F8FAFC', position: 'relative' }}>
          <div 
            style={{ 
              padding: '12px 18px', 
              background: '#FFFFFF', 
              borderBottom: '1.5px solid #F1F5F9', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '14px', 
                  background: `linear-gradient(135deg, ${activeCh.color} 0%, ${activeCh.color}DD 100%)`, 
                  color: '#FFFFFF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem',
                  boxShadow: `0 6px 16px ${activeCh.color}35`,
                  flexShrink: 0
                }}
              >
                <activeCh.icon size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeCh.name}
                </h3>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
                  <span>{activeCh.online} អង្គ/នាក់ កំពុងអនឡាញ</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveCall('voice')}
                className="hover-lift"
                title="Voice Call / ខលជាសំឡេង"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: '#EFF6FF',
                  border: '1.5px solid #BFDBFE',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Phone size={17} />
              </button>

              <button
                type="button"
                onClick={() => setActiveCall('video')}
                className="hover-lift"
                title="Video Call / ខលជាវីដេអូ"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: '#ECFDF5',
                  border: '1.5px solid #A7F3D0',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <VideoCallIcon size={17} />
              </button>
            </div>
          </div>

          <div 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              backgroundImage: 'radial-gradient(#CBD5E1 0.75px, transparent 0.75px)',
              backgroundSize: '16px 16px',
              backgroundColor: '#F1F5F9'
            }}
          >
            {messages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', padding: '30px 20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FFFFFF', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
                  <Sparkles size={28} color="#D97706" />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155', margin: 0 }}>
                  ចាប់ផ្ដើមការសន្ទនាក្នុង {activeCh.name}
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: '320px', margin: '6px auto 0' }}>
                  អាចផ្ញើសារអក្សរ សំឡេង (Voice) រូបភាព វីដេអូ ឯកសារ Sticker និងខលសន្ទនាបានដូច Telegram
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: msg.is_self ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: msg.is_self ? 'flex-end' : 'flex-start'
                  }}
                >
                  {!msg.is_self && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563EB', marginBottom: '3px', paddingLeft: '4px' }}>
                      {msg.sender_name}
                    </span>
                  )}

                  <div 
                    style={{ 
                      background: msg.is_self ? '#E1FFC7' : '#FFFFFF', 
                      color: '#0F172A',
                      borderRadius: msg.is_self ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      padding: msg.type === 'sticker' ? '4px' : '10px 14px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      position: 'relative',
                      border: msg.is_self ? '1px solid #C8E6C9' : '1px solid #E2E8F0',
                      maxWidth: '100%'
                    }}
                  >
                    {msg.type === 'text' && (
                      <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.45, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </p>
                    )}

                    {msg.type === 'sticker' && (
                      <div style={{ fontSize: '3.5rem', lineHeight: 1, padding: '4px' }}>
                        {msg.sticker_emoji}
                      </div>
                    )}

                    {msg.type === 'image' && msg.media_url && (
                      <div>
                        <img 
                          src={msg.media_url} 
                          alt="Photo" 
                          style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '12px', objectFit: 'cover' }} 
                        />
                        {msg.file_name && (
                          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
                            {msg.file_name}
                          </div>
                        )}
                      </div>
                    )}

                    {msg.type === 'video' && msg.media_url && (
                      <div>
                        <video 
                          src={msg.media_url} 
                          controls 
                          style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: '12px' }} 
                        />
                      </div>
                    )}

                    {msg.type === 'file' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.03)', padding: '8px 12px', borderRadius: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#2563EB', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {msg.file_name || 'ឯកសារភ្ជាប់'}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                            {msg.file_size || 'ឯកសារ'}
                          </div>
                        </div>
                        {msg.media_url && (
                          <a href={msg.media_url} download={msg.file_name} style={{ color: '#2563EB' }}>
                            <Download size={16} />
                          </a>
                        )}
                      </div>
                    )}

                    {msg.type === 'audio' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (playingAudioId === msg.id) {
                              setPlayingAudioId(null)
                            } else {
                              setPlayingAudioId(msg.id)
                            }
                          }}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#2563EB',
                            color: '#FFFFFF',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          {playingAudioId === msg.id ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                        </button>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '18px' }}>
                            {[40, 70, 30, 90, 50, 80, 60, 100, 45, 75, 35, 65, 85, 55].map((h, idx) => (
                              <span 
                                key={idx} 
                                style={{ 
                                  width: '3px', 
                                  height: `${h}%`, 
                                  background: playingAudioId === msg.id ? '#2563EB' : '#94A3B8', 
                                  borderRadius: '2px' 
                                }} 
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, marginTop: '2px', display: 'block' }}>
                            🎙️ {msg.audio_duration || '0:05'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px', marginTop: '3px' }}>
                      <span style={{ fontSize: '0.62rem', color: '#64748B' }}>
                        {msg.created_at}
                      </span>
                      {msg.is_self && <CheckCheck size={13} color="#2563EB" />}
                    </div>

                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {showAttachMenu && (
            <div 
              className="animate-fadeIn"
              style={{
                position: 'absolute',
                bottom: '72px',
                left: '16px',
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '12px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                border: '1.5px solid #E2E8F0',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                zIndex: 30
              }}
            >
              <button 
                onClick={() => photoInputRef.current?.click()}
                className="hover-lift"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '16px', cursor: 'pointer' }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={18} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155' }}>រូបថត (Photo)</span>
              </button>

              <button 
                onClick={() => videoInputRef.current?.click()}
                className="hover-lift"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '16px', cursor: 'pointer' }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={18} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155' }}>វីដេអូ (Video)</span>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="hover-lift"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '16px', cursor: 'pointer' }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FAF5FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155' }}>ឯកសារ (File)</span>
              </button>
            </div>
          )}

          {showStickerPicker && (
            <div 
              className="animate-fadeIn"
              style={{
                position: 'absolute',
                bottom: '72px',
                right: '60px',
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '14px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                border: '1.5px solid #E2E8F0',
                width: '240px',
                zIndex: 30
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>
                ✨ ជ្រើសរើស Sticker
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {STICKER_PACK.map((stk, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendSticker(stk)}
                    className="hover-lift"
                    style={{ fontSize: '1.8rem', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '10px' }}
                  >
                    {stk}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div 
            style={{ 
              padding: '12px 14px', 
              background: '#FFFFFF', 
              borderTop: '1.5px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 -4px 16px rgba(0,0,0,0.02)'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(!showAttachMenu)
                setShowStickerPicker(false)
              }}
              className="hover-lift"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title="Attach Media / File"
            >
              <Paperclip size={18} />
            </button>

            {isRecording ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FEF2F2', padding: '8px 14px', borderRadius: '16px', border: '1.5px solid #FECACA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontWeight: 800, fontSize: '0.82rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626', animation: 'pulse 1s infinite' }} />
                  <span>កំពុងថត: {formatTimer(recordTime)}</span>
                </div>
                <button
                  onClick={stopRecording}
                  style={{ background: '#DC2626', color: '#FFF', border: 'none', padding: '5px 12px', borderRadius: '10px', fontWeight: 800, fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  ផ្ញើសំឡេង
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendText} style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="សរសេរសារផ្ញើ..." 
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '18px',
                    padding: '9px 40px 9px 14px',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontWeight: 600,
                    color: '#0F172A'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowStickerPicker(!showStickerPicker)
                    setShowAttachMenu(false)
                  }}
                  style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                  title="Sticker"
                >
                  <Smile size={18} />
                </button>
              </form>
            )}

            {inputText.trim() ? (
              <button
                type="button"
                onClick={() => handleSendText()}
                className="hover-lift"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                  flexShrink: 0
                }}
              >
                <Send size={16} style={{ marginLeft: '1px' }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className="hover-lift"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: isRecording ? '#DC2626' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isRecording ? '0 4px 12px rgba(220, 38, 38, 0.4)' : '0 4px 12px rgba(37, 99, 235, 0.35)',
                  flexShrink: 0
                }}
                title={isRecording ? 'បញ្ឈប់ការថត' : 'ថតសំឡេង (Voice Message)'}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}

          </div>
        </div>
      </div>

      {activeCall && (
        <div 
          className="animate-fadeIn"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(180deg, #09122C 0%, #060B1E 100%)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '40px 20px',
            color: '#FFFFFF'
          }}
        >
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ fontSize: '0.8rem', color: '#93C5FD', fontWeight: 700, background: 'rgba(59, 130, 246, 0.15)', padding: '4px 16px', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              {activeCall === 'video' ? '📹 Telegram Video Call' : '📞 Telegram Voice Call'}
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', margin: '14px 0 4px' }}>
              {activeCh.name}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#A7F3D0', fontWeight: 700, margin: 0 }}>
              ● កំពុងសន្ទនា ({formatTimer(callDuration)})
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                padding: '5px',
                boxShadow: '0 0 50px rgba(59, 130, 246, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s infinite'
              }}
            >
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 900 }}>
                {activeCh.id === 'monks' ? '👥' : activeCh.id === 'management' ? '🏛️' : '☸️'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <button
              onClick={() => setCallMuted(!callMuted)}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: callMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {callMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            <button
              onClick={() => setActiveCall(null)}
              className="hover-lift"
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#EF4444',
                border: 'none',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.6)'
              }}
            >
              <PhoneOff size={28} />
            </button>

            <button
              onClick={() => setCallVideoOff(!callVideoOff)}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: callVideoOff ? '#EF4444' : 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Video size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
