import RegisterForm from "@/components/RegisterForm";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">OO교회</h1>
          <p className="text-slate-500">교인 회원가입</p>
        </div>
        
        <RegisterForm />
        
        <div className="mt-6 text-center text-sm text-slate-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
