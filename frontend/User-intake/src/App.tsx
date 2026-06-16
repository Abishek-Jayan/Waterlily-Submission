import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import './App.css'
import QuestionForm from './QuestionForm'
import Auth from './Auth'
import { fetchJSON } from './api'

export type User = { id: number; username: string }

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        await fetchJSON('/csrf/')
        const res = await fetchJSON('/me/')
        setUser(res?.user ?? null)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <>
      <Toaster position="top-right" />
      {user ? (
        <QuestionForm user={user} onLogout={() => setUser(null)} />
      ) : (
        <Auth onAuthed={setUser} />
      )}
    </>
  )
}

export default App
