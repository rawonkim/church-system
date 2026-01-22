import Link from "next/link";
import { Home, BookOpen, FileText, Settings, User, LogOut, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions";

const menuItems = [
  { icon: Home, label: "홈", href: "/" },
  { icon: BookOpen, label: "회계 장부", href: "/ledger" },
  { icon: FileText, label: "연말정산", href: "/tax" },
  { icon: Settings, label: "내 정보", href: "/profile" },
];

const adminItems = [
  { icon: User, label: "교인 관리", href: "/admin" },
  { icon: ShieldAlert, label: "감사 로그", href: "/admin/audit" },
];

interface SidebarProps {
  user?: {
    name: string;
    role: string;
    id: string;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col p-6 fixed left-0 top-0">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-slate-800">OO교회</h1>
        <p className="text-xs text-slate-500 mt-1">회계 및 행정 시스템</p>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors",
              "hover:text-blue-600"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              관리자
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors",
                  "hover:text-blue-600"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100 space-y-2">
        <div className="px-4 py-2">
          <p className="text-sm font-bold text-slate-800">{user?.name || '사용자'}</p>
          <p className="text-xs text-slate-500">{isAdmin ? '관리자' : '교인'}</p>
        </div>
        
        <form action={logout}>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer text-left">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">로그아웃</span>
          </button>
        </form>
      </div>
    </div>
  );
}
