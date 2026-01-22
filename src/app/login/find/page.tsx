'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { findEmail, resetPassword } from '@/app/actions'
import { ArrowLeft, User, Lock, Phone, Mail } from 'lucide-react'

export default function FindAccountPage() {
  const [activeTab, setActiveTab] = useState<'find-id' | 'reset-pw'>('find-id')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  // Find ID State
  const [findIdForm, setFindIdForm] = useState({ name: '', phoneNumber: '' })
  const [foundEmail, setFoundEmail] = useState('')

  // Reset PW State
  const [resetPwForm, setResetPwForm] = useState({ name: '', email: '', phoneNumber: '', newPassword: '' })

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFoundEmail('')

    try {
      const result = await findEmail(findIdForm.name, findIdForm.phoneNumber)
      if (result.error) {
        setError(result.error)
      } else {
        setFoundEmail(result.email || '')
      }
    } catch (e) {
      setError('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPw = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const result = await resetPassword(
        resetPwForm.name, 
        resetPwForm.email, 
        resetPwForm.phoneNumber, 
        resetPwForm.newPassword
      )
      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMessage('비밀번호가 성공적으로 변경되었습니다.')
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch (e) {
      setError('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 w-full max-w-md">
        <Link href="/login" className="inline-flex items-center text-slate-400 hover:text-slate-600 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          로그인으로 돌아가기
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">계정 찾기</h1>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 mb-6">
          <button
            onClick={() => { setActiveTab('find-id'); setError(''); setSuccessMessage(''); }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'find-id' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            아이디 찾기
          </button>
          <button
            onClick={() => { setActiveTab('reset-pw'); setError(''); setSuccessMessage(''); }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'reset-pw' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            비밀번호 재설정
          </button>
        </div>

        {activeTab === 'find-id' ? (
          <form onSubmit={handleFindId} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={findIdForm.name}
                  onChange={e => setFindIdForm({...findIdForm, name: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="홍길동"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">전화번호</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={findIdForm.phoneNumber}
                  onChange={e => {
                     let val = e.target.value.replace(/[^0-9]/g, '');
                     if (val.length > 11) val = val.slice(0, 11);
                     if (val.length > 3 && val.length <= 7) val = val.slice(0, 3) + '-' + val.slice(3);
                     else if (val.length > 7) val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7);
                     setFindIdForm({...findIdForm, phoneNumber: val})
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>

            {foundEmail && (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-center text-sm">
                회원님의 아이디(이메일)는<br/>
                <strong className="text-lg block mt-1">{foundEmail}</strong>
                입니다.
              </div>
            )}

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? '찾는 중...' : '아이디 찾기'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPw} className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={resetPwForm.name}
                  onChange={e => setResetPwForm({...resetPwForm, name: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="홍길동"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">이메일 (아이디)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={resetPwForm.email}
                  onChange={e => setResetPwForm({...resetPwForm, email: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="user@church.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">전화번호</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={resetPwForm.phoneNumber}
                  onChange={e => {
                     let val = e.target.value.replace(/[^0-9]/g, '');
                     if (val.length > 11) val = val.slice(0, 11);
                     if (val.length > 3 && val.length <= 7) val = val.slice(0, 3) + '-' + val.slice(3);
                     else if (val.length > 7) val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7);
                     setResetPwForm({...resetPwForm, phoneNumber: val})
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">새 비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={resetPwForm.newPassword}
                  onChange={e => setResetPwForm({...resetPwForm, newPassword: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="새로운 비밀번호"
                />
              </div>
            </div>

            {successMessage && (
              <div className="p-4 bg-green-50 text-green-800 rounded-xl text-center text-sm">
                {successMessage}
              </div>
            )}

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? '변경 중...' : '비밀번호 변경하기'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
