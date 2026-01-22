'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions'
import { Loader2 } from 'lucide-react'

export default function LoginForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    if (loading) return // Prevent multiple submissions
    setLoading(true)
    setError('')
    
    try {
      const result = await login(formData)
      
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else {
        // Login success
        // Don't set loading to false here to prevent flash while redirecting
        router.refresh() // Update server components with new session
        router.push('/')
      }
    } catch (e) {
      setError('로그인 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          이메일
        </label>
        <input
          name="email"
          type="email"
          required
          disabled={loading}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:bg-slate-50"
          placeholder="admin@church.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          비밀번호
        </label>
        <input
          name="password"
          type="password"
          required
          disabled={loading}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:bg-slate-50"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2 animate-pulse">
          <span className="font-bold">!</span> {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-2 h-11"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>로그인 중...</span>
          </>
        ) : (
          '로그인'
        )}
      </Button>
    </form>
  )
}

function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}
