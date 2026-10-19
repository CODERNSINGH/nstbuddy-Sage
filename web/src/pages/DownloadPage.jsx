import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import Banner from '../components/Banner.jsx'
import DownloadCard from '../components/DownloadCard.jsx'
import { Card, ErrorText, Label, Logo } from '../components/ui.jsx'
import { MonitorDown } from 'lucide-react'

// Public page an admin can share at any time: it only lets people download the app
export default function DownloadPage() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api(`/public/downloads/${slug}`)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [slug])

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex justify-center"><Logo className="h-8" /></div>
        <Card className="p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          {!data && (error ? <ErrorText>{error}</ErrorText> : <p className="text-slate-500">Loading...</p>)}
          {data && (
            <>
              <Banner icon={MonitorDown} />
              <div className="mt-6 mb-7">
                <Label>{data.clubName}</Label>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Get the NstBuddy Sage app</h1>
                <p className="mt-2 text-slate-600">Install this app on your MacBook to attend proctored quizzes. You login with the email and password sent to your inbox.</p>
              </div>
              <DownloadCard url={data.download} />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
