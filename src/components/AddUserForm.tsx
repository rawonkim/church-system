'use client'

import { addUser } from "@/app/actions";
import { UserPlus, Search } from "lucide-react";
import { useRef, useState } from "react";
import DaumPostcode from "react-daum-postcode";

export function AddUserForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState('');
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [address, setAddress] = useState('');

  const handleComplete = (data: any) => {
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
    setIsPostcodeOpen(false);
  };

  const handleResidentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 6) {
      value = value.slice(0, 6) + '-' + value.slice(6);
    }
    if (value.length > 14) {
      value = value.slice(0, 14);
    }
    e.target.value = value;
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-primary" />
        새 교인 등록
      </h3>
      <form 
        ref={formRef}
        action={async (formData) => {
          setError('');
          const residentId = formData.get('residentId') as string;
          
          if (residentId && !/^\d{6}-\d{7}$/.test(residentId)) {
            setError('주민등록번호 형식이 올바르지 않습니다. (예: 800101-1234567)');
            return;
          }

          const result = await addUser(formData);
          if (result?.error) {
            setError(result.error);
          } else {
            alert('교인이 등록되었습니다.');
            formRef.current?.reset();
            setAddress('');
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">이름</label>
          <input 
            type="text" 
            name="name" 
            required
            placeholder="홍길동"
            className="w-full px-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">전화번호 (필수)</label>
          <input 
            type="tel" 
            name="phoneNumber" 
            required
            maxLength={13}
            placeholder="010-0000-0000"
            className="w-full px-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            onChange={(e) => {
              // Auto-format phone number
              let value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length > 3 && value.length <= 7) {
                value = value.slice(0, 3) + '-' + value.slice(3);
              } else if (value.length > 7) {
                value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
              }
              e.target.value = value;

              // Auto-generate password from last 4 digits
              const phone = value;
              const last4 = phone.replace(/[^0-9]/g, '').slice(-4);
              const pwInput = document.querySelector('input[name="password"]') as HTMLInputElement;
              if (pwInput && last4.length === 4) {
                pwInput.value = last4;
              }
            }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">아이디 (이메일)</label>
          <input 
            type="email" 
            name="email" 
            required
            placeholder="user@church.com"
            className="w-full px-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">비밀번호 (기본: 전화뒷자리)</label>
          <input 
            type="text" 
            name="password" 
            required
            placeholder="비밀번호"
            className="w-full px-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
          />
        </div>

        <div className="space-y-1 relative">
          <label className="text-xs font-semibold text-slate-500 ml-1">주소</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              name="address" 
              value={address}
              readOnly
              placeholder="주소 검색 클릭"
              className="w-full px-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 cursor-pointer"
              onClick={() => setIsPostcodeOpen(!isPostcodeOpen)}
            />
            <button
              type="button"
              onClick={() => setIsPostcodeOpen(!isPostcodeOpen)}
              className="bg-slate-100 p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          
          {/* Daum Postcode Popover */}
          {isPostcodeOpen && (
            <div className="absolute top-full left-0 mt-2 w-full z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center p-3 bg-slate-50 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600 ml-1">우편번호 검색</span>
                <button 
                  type="button"
                  onClick={() => setIsPostcodeOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <DaumPostcode 
                  onComplete={handleComplete} 
                  style={{ width: '100%' }} 
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">주민등록번호 (선택)</label>
          <input 
            type="text" 
            name="residentId" 
            onChange={handleResidentIdChange}
            placeholder="000000-0000000"
            className={`w-full px-4 py-2 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-primary/20 ${error ? 'border-red-300' : 'border-slate-200'}`}
          />
        </div>

        {error && <p className="col-span-full text-xs text-red-500 ml-1">{error}</p>}

        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end mt-4 mb-4">
          <button 
            type="submit"
            className="bg-slate-900 text-white px-6 py-2 rounded-2xl hover:bg-slate-800 transition-colors font-medium min-w-[120px]"
          >
            교인 등록하기
          </button>
        </div>
      </form>

      {/* Old Modal Removed */}
    </div>
  );
}
