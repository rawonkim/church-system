'use client'

import { useState } from 'react';
import { KakaoShareButton } from "@/components/KakaoShareButton";
import { MessageCircle, Trash2 } from "lucide-react";
import { deleteUser, deleteUsers } from "@/app/actions";

import { formatDate } from "@/lib/utils";

interface UserListProps {
  users: any[];
}

export function UserList({ users }: UserListProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const toggleUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleBulkMessage = () => {
    if (selectedUsers.length === 0) return;
    
    const count = selectedUsers.length;
    if (confirm(`${count}명에게 알림톡을 발송하시겠습니까?\n(현재는 데모 기능입니다)`)) {
      alert(`${count}명에게 알림톡이 발송되었습니다.`);
      setSelectedUsers([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    const count = selectedUsers.length;
    if (confirm(`${count}명의 교인을 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      const result = await deleteUsers(selectedUsers);
      if (result?.error) {
        alert(result.error);
      } else {
        alert(`${count}명이 삭제되었습니다.`);
        setSelectedUsers([]);
      }
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`정말 '${userName}' 교인을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      const result = await deleteUser(userId);
      if (result?.error) {
        alert(result.error);
      } else {
        alert('삭제되었습니다.');
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">교인 목록 ({users.length}명)</h2>
        
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={handleBulkMessage}
              className="flex items-center gap-2 bg-[#FEE500] text-[#3A1D1D] px-5 py-2.5 rounded-xl font-bold hover:bg-[#FDD835] transition-colors shadow-sm"
            >
              <MessageCircle className="w-5 h-5 fill-[#3A1D1D] stroke-none" />
              {selectedUsers.length}명 알림톡
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors shadow-sm"
            >
              <Trash2 className="w-5 h-5" />
              {selectedUsers.length}명 삭제
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-sm">
              <th className="pb-3 pl-4 w-10">
                <input 
                  type="checkbox" 
                  onChange={toggleSelectAll}
                  checked={users.length > 0 && selectedUsers.length === users.length}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
              </th>
              <th className="pb-3 pl-2">이름</th>
              <th className="pb-3">이메일</th>
              <th className="pb-3">연락처</th>
              <th className="pb-3">주민등록번호 (마스킹)</th>
              <th className="pb-3">등록일</th>
              <th className="pb-3">역할</th>
              <th className="pb-3 text-right pr-4">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="group hover:bg-slate-50 transition-colors">
                <td className="py-4 pl-4">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.includes(u.id)}
                    onChange={() => toggleUser(u.id)}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </td>
                <td className="py-4 pl-2 text-slate-800 font-medium">{u.name}</td>
                <td className="py-4 text-slate-600 text-sm">{u.email || '-'}</td>
                <td className="py-4 text-slate-600 text-sm">{u.phoneNumber || '-'}</td>
                <td className="py-4 text-slate-600 font-mono text-sm">
                  {u.residentId ? u.residentId.substring(0, 8) + "******" : '-'}
                </td>
                <td className="py-4 text-slate-500 text-sm">{formatDate(u.createdAt)}</td>
                <td className="py-4">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                    {u.role}
                  </span>
                </td>
                <td className="py-4 text-right pr-4">
                  <div className="flex items-center justify-end gap-4">
                    <KakaoShareButton user={u} />
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shadow-sm"
                      title="교인 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  등록된 교인이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
