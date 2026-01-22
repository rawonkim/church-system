import LoginForm from "@/components/LoginForm";
import { Wallet } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">OO교회</h1>
          <p className="text-slate-500">재정/행정 관리 시스템</p>
        </div>
        
        <LoginForm />

        <div className="mt-6 flex flex-col gap-3 text-center text-sm text-slate-500">
          <div>
            계정이 없으신가요?{" "}
            <Link href="/register" className="text-blue-600 font-medium hover:underline inline-block p-1">
              회원가입하기
            </Link>
          </div>
          <div>
            <Link href="/login/find" className="text-slate-400 hover:text-slate-600 text-xs inline-block p-2 hover:bg-slate-50 rounded-lg transition-colors">
              아이디/비밀번호 찾기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
