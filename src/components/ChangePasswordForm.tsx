'use client'

import { changePassword } from "@/app/actions";
import { Lock } from "lucide-react";
import { useRef, useState } from "react";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 max-w-md mx-auto">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Lock className="w-5 h-5 text-primary" />
        비밀번호 변경
      </h3>
      <form 
        ref={formRef}
        action={async (formData) => {
          setError('');
          setSuccess('');
          const result = await changePassword(formData);
          
          if (result?.error) {
            setError(result.error);
          } else {
            setSuccess('비밀번호가 성공적으로 변경되었습니다.');
            formRef.current?.reset();
          }
        }}
        className="space-y-4"
      >
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">현재 비밀번호</label>
          <input 
            type="password" 
            name="currentPassword" 
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">새 비밀번호</label>
          <input 
            type="password" 
            name="newPassword" 
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">새 비밀번호 확인</label>
          <input 
            type="password" 
            name="confirmPassword" 
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
        {success && <p className="text-sm text-blue-500 font-medium">{success}</p>}

        <button 
          type="submit"
          className="w-full bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-colors font-medium mt-4"
        >
          변경하기
        </button>
      </form>
    </div>
  );
}
