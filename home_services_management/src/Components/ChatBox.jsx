import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { createEcho } from '../utils/echo'

function ChatBox({ token, currentUserId, otherUser, bookingId = null, onClose }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  const api = axios.create({
    baseURL: 'http://localhost:8001/api',
    headers: { Authorization: `Bearer ${token}` }
  })

  useEffect(() => {
    let echo
    api.get(`/messages/${otherUser.id}`, { params: { booking_id: bookingId } })
      .then(res => setMessages(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))

    echo = createEcho(token)
    echo.private(`chat.${currentUserId}`)
      .listen('.message.sent', (e) => {
        if (e.message.sender_id === otherUser.id) {
          setMessages(prev => [...prev, e.message])
        }
      })

    return () => echo.leave(`chat.${currentUserId}`)
  }, [otherUser.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!text.trim()) return
    try {
      const res = await api.post('/messages', {
        receiver_id: otherUser.id,
        booking_id: bookingId,
        message: text
      })
      setMessages(prev => [...prev, res.data])
      setText('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-5 w-full max-w-md
                      text-white flex flex-col h-[500px]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">💬 {otherUser.username}</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
                       flex items-center justify-center">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
          {loading ? (
            <p className="text-white/40 text-sm text-center mt-4">Loading...</p>
          ) : messages.map(m => (
            <div key={m.id}
              className={`max-w-[75%] px-3 py-2 rounded-xl text-sm
                ${m.sender_id === currentUserId
                  ? 'bg-teal-500 ml-auto'
                  : 'bg-white/10'}`}>
              {m.message}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-xl bg-white/10 border
                       border-white/20 text-sm focus:outline-none
                       focus:ring-2 focus:ring-teal-400" />
          <button onClick={send}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-xl text-sm">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
