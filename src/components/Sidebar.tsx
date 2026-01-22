'use client';

import Link from "next/link";
import { Home, BookOpen, FileText, Settings, User, LogOut, ShieldAlert, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = user?.role === 'ADMIN';

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Header - Always visible */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40 shadow-sm safe-area-inset-top">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 transition-transform"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-slate-800">OO교회</span>
        </div>
        <div className="text-sm font-medium text-slate-600 truncate max-w-[120px]">
          {user?.name}
        </div>
      </div>

      {/* Sidebar Content */}
      <div className={cn(
        "h-screen w-64 bg-white border-r border-slate-200 flex flex-col p-6 fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="mb-8 px-2 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">OO교회</h1>
            <p className="text-xs text-slate-500 mt-1">회계 및 행정 시스템</p>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 active:scale-95 touch-manipulation",
                  isActive 
                    ? "bg-blue-50 text-blue-600 font-semibold shadow-sm ring-1 ring-blue-100" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "fill-blue-600/10")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                관리자
              </div>
              {adminItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 active:scale-95 touch-manipulation",
                      isActive 
                        ? "bg-amber-50 text-amber-700 font-semibold shadow-sm ring-1 ring-amber-100" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-amber-700"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive && "fill-amber-700/10")} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 space-y-2">
          <div className="px-4 py-2">
            <p className="text-sm font-bold text-slate-800">{user?.name || '사용자'}</p>
            <p className="text-xs text-slate-500">{isAdmin ? '관리자' : '교인'}</p>
          </div>
          
          <form action={logout}>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 rounded-2xl hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all cursor-pointer text-left touch-manipulation">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">로그아웃</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
