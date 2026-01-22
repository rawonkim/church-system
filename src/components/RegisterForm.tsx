'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '@/app/actions'
import DaumPostcode from 'react-daum-postcode';

export default function RegisterForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpenPostcode, setIsOpenPostcode] = useState(false)
  const [address, setAddress] = useState('')
  const router = useRouter()

  const handleCompletePostcode = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    setAddress(fullAddress);
    setIsOpenPostcode(false);
  };

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    residentId: '',
    addressDetail: ''
  })

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    
    // Simple client-side validation
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    // Resident ID validation (if provided)
    const residentId = formData.get('residentId') as string
    if (residentId) {
      if (!/^\d{6}-\d{7}$/.test(residentId)) {
        setError('주민등록번호 형식이 올바르지 않습니다. (예: 800101-1234567)')
        setLoading(false)
        return
      }
    }

    try {
      // Add hidden address field to form data
      if (address) {
        formData.append('address', address)
      }
      
      const result = await register(formData)
      
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else {
        // Register success -> Redirect to login
        alert('회원가입이 완료되었습니다. 로그인해주세요.')
        router.push('/login')
      }
    } catch (e) {
      setError('회원가입 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleResidentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 6) {
      value = value.slice(0, 6) + '-' + value.slice(6);
    }
    if (value.length > 14) {
      value = value.slice(0, 14);
    }
    setFormValues(prev => ({ ...prev, residentId: value }));
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          이름
        </label>
        <input
          name="name"
          type="text"
          required
          value={formValues.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="홍길동"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          이메일
        </label>
        <input
          name="email"
          type="email"
          required
          value={formValues.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="user@church.com"
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
          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          비밀번호 확인
        </label>
        <input
          name="confirmPassword"
          type="password"
          required
          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          휴대폰 번호 (선택: 알림톡용)
        </label>
        <input
          name="phoneNumber"
          type="tel"
          value={formValues.phoneNumber}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="010-0000-0000"
          onChange={(e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length > 3 && value.length <= 7) {
              value = value.slice(0, 3) + '-' + value.slice(3);
            } else if (value.length > 7) {
              value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
            }
            if (value.length > 13) value = value.slice(0, 13);
            setFormValues(prev => ({ ...prev, phoneNumber: value }));
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          주민등록번호 (선택: 연말정산용)
        </label>
        <input
          name="residentId"
          type="text"
          value={formValues.residentId}
          onChange={handleResidentIdChange}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="000000-0000000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          주소 (선택: 연말정산용)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            name="address"
            type="text"
            readOnly
            value={address}
            onClick={() => setIsOpenPostcode(!isOpenPostcode)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 cursor-pointer"
            placeholder="주소 검색을 클릭하세요"
          />
          <button
            type="button"
            onClick={() => setIsOpenPostcode(!isOpenPostcode)}
            className="whitespace-nowrap px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            주소 검색
          </button>
        </div>
        {/* Hidden input for address if not appended manually */}
        <input type="hidden" name="address" value={address} />
        {isOpenPostcode && (
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-2">
            <DaumPostcode onComplete={handleCompletePostcode} />
          </div>
        )}
        <input
          name="addressDetail"
          type="text"
          value={formValues.addressDetail}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="상세 주소 입력 (동, 호수 등)"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white hover:bg-slate-800"
      >
        {loading ? '가입 중...' : '가입하기'}
      </Button>

      {/* Admin Code (Hidden Feature) */}
      <div className="pt-4 border-t border-slate-100 mt-4">
        <details className="group">
          <summary className="text-xs text-slate-400 cursor-pointer list-none flex items-center gap-1 hover:text-slate-600">
            관리자 계정으로 가입하시나요?
          </summary>
          <div className="mt-2">
            <input
              name="secretCode"
              type="password"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="관리자 인증 코드"
            />
          </div>
        </details>
      </div>
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
