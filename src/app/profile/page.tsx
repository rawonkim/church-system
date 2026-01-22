import { getSession } from "@/app/actions";
import { Sidebar } from "@/components/Sidebar";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { redirect } from "next/navigation";
import { UserCircle } from "lucide-react";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar user={session} />
      <div className="flex-1 lg:ml-64 p-4 lg:p-12 pt-20 lg:pt-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">내 정보</h1>
            <p className="text-slate-500">개인정보 및 비밀번호를 관리합니다.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <UserCircle className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{session.name}</h2>
              <p className="text-slate-500">{session.role === 'ADMIN' ? '관리자' : '교인'}</p>
            </div>
          </div>

          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
