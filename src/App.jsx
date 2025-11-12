import { useEffect, useMemo, useRef, useState } from 'react'

const LANG_OPTIONS = [
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
]

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [text, setText] = useState('Hello! Welcome to our multilingual Indian language dubber. Type anything here and translate it.')
  const [target, setTarget] = useState('hi')
  const [translated, setTranslated] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const audioRef = useRef(null)

  const targetName = useMemo(() => LANG_OPTIONS.find(l => l.code === target)?.name || target, [target])

  const handleTranslate = async () => {
    setLoading(true)
    setError('')
    setTranslated('')
    try {
      const res = await fetch(`${BACKEND_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_language: target }),
      })
      if (!res.ok) throw new Error(`Translate error: ${res.status}`)
      const data = await res.json()
      setTranslated(data.translated)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTTS = async () => {
    if (!translated) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: translated, language: target }),
      })
      const data = await res.json()
      if (data.url) {
        // If backend later serves real audio, we can stream it
        if (audioRef.current) {
          audioRef.current.src = data.url
          audioRef.current.play()
        }
      } else {
        alert('Demo mode: audio generation is not wired to a provider yet. The backend returned a placeholder response.')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Optionally fetch supported languages from backend (not strictly needed since we have a local list)
    // fetch(`${BACKEND_URL}/supported-languages`).then(r => r.json()).then(console.log).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sky-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Indian Language Dubber</h1>
          <p className="text-gray-600 mt-2">Translate any text to Indian regional languages and generate voice. Demo mode for audio.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">Enter text</label>
            <textarea
              className="w-full h-48 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700">Target language</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                {LANG_OPTIONS.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleTranslate}
                disabled={loading || !text.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md"
              >
                {loading ? 'Translating...' : 'Translate'}
              </button>
              <button
                onClick={handleTTS}
                disabled={loading || !translated}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-md"
              >
                {loading ? 'Generating...' : 'Generate Voice'}
              </button>
              <a href="/test" className="ml-auto text-sm text-gray-600 underline">Check backend</a>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Result ({targetName})</h2>
            <div className="min-h-24 p-3 rounded-md bg-gray-50 border border-gray-100">
              {translated ? (
                <p className="whitespace-pre-wrap text-gray-900">{translated}</p>
              ) : (
                <p className="text-gray-500">Your translation will appear here.</p>
              )}
            </div>

            <div>
              <audio ref={audioRef} controls className="w-full" />
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-gray-500 mt-10">
          Note: Translation uses a public demo API and may be rate-limited. For production, connect your own translation and TTS providers.
        </footer>
      </div>
    </div>
  )
}

export default App
