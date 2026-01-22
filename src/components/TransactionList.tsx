'use client'

import { useState } from "react";
import { updateTransaction, deleteTransaction } from "@/app/actions";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Pencil, Trash2, X, Check, Search, Filter, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { OFFERING_CATEGORIES, EXPENSE_CATEGORIES } from "./AddTransactionForm";
import Link from 'next/link';

export function TransactionList({ transactions, users, isAdmin, initialFilter, totalPages = 1, currentPage = 1 }: { 
  transactions: any[], 
  users: any[], 
  isAdmin: boolean,
  initialFilter?: {
    dateStart: string,
    dateEnd: string,
    type: string,
    category: string,
    userName: string,
    description: string
  },
  totalPages?: number,
  currentPage?: number
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(!!initialFilter?.type);
  
  // Filter State
  const [filter, setFilter] = useState({
    dateStart: initialFilter?.dateStart || '',
    dateEnd: initialFilter?.dateEnd || '',
    type: initialFilter?.type || '',
    category: initialFilter?.category || '',
    userName: initialFilter?.userName || '',
    description: initialFilter?.description || ''
  });

  // Edit Form State
  const [editForm, setEditForm] = useState<any>(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const filteredTransactions = transactions.filter(t => {
    if (filter.dateStart && t.date < new Date(filter.dateStart)) return false;
    if (filter.dateEnd && t.date > new Date(filter.dateEnd)) return false;
    if (filter.type && t.type !== filter.type) return false;
    if (filter.category && t.category !== filter.category) return false;
    if (filter.userName && !(t.user?.name || '').includes(filter.userName)) return false;
    if (filter.description && !(t.description || '').includes(filter.description)) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (confirm("정말 이 내역을 삭제하시겠습니까? 복구할 수 없습니다.")) {
      await deleteTransaction(id);
    }
  };

  const startEdit = (t: any) => {
    setEditingId(t.id);
    setEditForm({
      id: t.id,
      date: new Date(t.date).toISOString().split('T')[0],
      type: t.type,
      category: t.category,
      amount: t.amount,
      userId: t.userId || "",
      userName: t.user?.name || "",
      description: t.description || ""
    });
    setUserSearchTerm(t.user?.name || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setIsUserDropdownOpen(false);
  };

  const filteredUsers = users.filter(u => 
    u.name.includes(userSearchTerm) || 
    (u.phoneNumber && u.phoneNumber.includes(userSearchTerm))
  );

  const activeFilterCount = Object.values(filter).filter(Boolean).length;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header & Filter Toggle */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          재정 내역
          <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {filteredTransactions.length}건
          </span>
        </h2>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
            isFilterOpen || activeFilterCount > 0
              ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
              : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
          )}
        >
          <Filter className="w-4 h-4" />
          필터
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel (Collapsible) - Removed old implementation */}
      
      <div className="overflow-x-auto p-2">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-sm">
              <th className="pb-3 pl-4 pr-4 w-[150px] min-w-[150px]">날짜</th>
              <th className="pb-3 pr-4 w-[90px] min-w-[90px]">구분</th>
              <th className="pb-3 pr-4 w-[110px] min-w-[110px]">카테고리</th>
              <th className="pb-3 pr-4 w-[110px] min-w-[110px]">교인</th>
              <th className="pb-3 min-w-[150px]">내용</th>
              <th className="pb-3 text-right pr-4 w-[120px] min-w-[120px]">금액</th>
              {isAdmin && <th className="pb-3 text-right pr-4 w-[100px] min-w-[100px]">관리</th>}
            </tr>
            {isFilterOpen && (
              <tr className="bg-slate-50/50">
                <th className="p-2 pl-4 pr-4 align-top">
                  <div className="flex flex-col gap-2">
                    <input 
                      type="date" 
                      value={filter.dateStart}
                      onChange={e => setFilter({...filter, dateStart: e.target.value})}
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-100"
                    />
                    <input 
                      type="date" 
                      value={filter.dateEnd}
                      onChange={e => setFilter({...filter, dateEnd: e.target.value})}
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-100"
                    />
                  </div>
                </th>
                <th className="p-2 pr-4 align-top">
                  <select
                    value={filter.type}
                    onChange={e => setFilter({...filter, type: e.target.value})}
                    className="w-full h-8 px-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-100"
                  >
                    <option value="">전체</option>
                    <option value="INCOME">수입</option>
                    <option value="EXPENSE">지출</option>
                  </select>
                </th>
                <th className="p-2 pr-4 align-top">
                  <select
                    value={filter.category}
                    onChange={e => setFilter({...filter, category: e.target.value})}
                    className="w-full h-8 px-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-100"
                  >
                    <option value="">전체</option>
                    {OFFERING_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </th>
                <th className="p-2 pr-4 align-top">
                  <input 
                    type="text" 
                    value={filter.userName}
                    onChange={e => setFilter({...filter, userName: e.target.value})}
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-100 text-center"
                    placeholder="이름"
                  />
                </th>
                <th className="p-2 align-top">
                  <input 
                    type="text" 
                    value={filter.description}
                    onChange={e => setFilter({...filter, description: e.target.value})}
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-100"
                    placeholder="내용 검색"
                  />
                </th>
                <th className="p-2 align-top">
                  {/* Amount filter placeholder - currently empty */}
                </th>
                {isAdmin && (
                  <th className="p-2 pr-4 align-top text-right">
                    <button 
                      onClick={() => setFilter({dateStart: '', dateEnd: '', type: '', category: '', userName: '', description: ''})}
                      className="h-8 w-8 inline-flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      title="필터 초기화"
                    >
                      <RotateCcw className="w-3.5 h-3.5 hover:rotate-180 transition-transform duration-500" />
                    </button>
                  </th>
                )}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                {editingId === t.id ? (
                  // Edit Mode Row - Inline
                  <>
                    <td className="p-2 align-middle">
                      <input 
                        form={`edit-form-${t.id}`}
                        type="date" 
                        name="date" 
                        defaultValue={editForm.date}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </td>
                    <td className="p-2 align-middle">
                      <select 
                        form={`edit-form-${t.id}`}
                        name="type" 
                        value={editForm.type}
                        onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="INCOME">수입</option>
                        <option value="EXPENSE">지출</option>
                      </select>
                    </td>
                    <td className="p-2 align-middle">
                      <select 
                        form={`edit-form-${t.id}`}
                        name="category" 
                        defaultValue={editForm.category}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        {(editForm.type === 'INCOME' ? OFFERING_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 align-middle relative">
                      <input type="hidden" form={`edit-form-${t.id}`} name="userId" value={editForm.userId} />
                      <div className="relative">
                        <input
                          type="text"
                          value={userSearchTerm}
                          onChange={(e) => {
                            setUserSearchTerm(e.target.value);
                            setIsUserDropdownOpen(true);
                            if (!e.target.value) setEditForm({...editForm, userId: ""});
                          }}
                          onFocus={() => setIsUserDropdownOpen(true)}
                          className="w-full h-9 px-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 text-center"
                          placeholder="이름"
                        />
                      </div>
                      {isUserDropdownOpen && (
                        <div className="absolute z-20 w-[180px] top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                          {filteredUsers.map(u => (
                            <div
                              key={u.id}
                              className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs"
                              onClick={() => {
                                setEditForm({...editForm, userId: u.id});
                                setUserSearchTerm(u.name);
                                setIsUserDropdownOpen(false);
                              }}
                            >
                              {u.name} <span className="text-slate-400">({u.phoneNumber || '번호없음'})</span>
                            </div>
                          ))}
                          <div 
                            className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs text-red-500"
                            onClick={() => {
                              setEditForm({...editForm, userId: ""});
                              setUserSearchTerm("");
                              setIsUserDropdownOpen(false);
                            }}
                          >
                            선택 해제
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-2 align-middle">
                      <input 
                        form={`edit-form-${t.id}`}
                        type="text" 
                        name="description" 
                        defaultValue={editForm.description}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="내용"
                      />
                    </td>
                    <td className="p-2 align-middle">
                      <input 
                        form={`edit-form-${t.id}`}
                        type="number" 
                        name="amount" 
                        defaultValue={editForm.amount}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </td>
                    <td className="p-2 align-middle text-right">
                      <form 
                        id={`edit-form-${t.id}`}
                        action={async (formData) => {
                          await updateTransaction(t.id, formData);
                          setEditingId(null);
                        }}
                        className="inline-flex items-center gap-1"
                      >
                        <button type="submit" className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm" title="저장">
                          <Check className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={cancelEdit} className="p-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" title="취소">
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </>
                ) : (
                  // Read Mode Row
                  <>
                    <td className="py-4 pl-4 text-slate-600 text-sm">{formatDate(t.date)}</td>
                    <td className="py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        t.type === 'INCOME' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {t.type === 'INCOME' ? '수입' : '지출'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-700 text-sm font-medium">{t.category}</td>
                    <td className="py-4 text-slate-600 text-sm">
                      {t.user?.name || '-'}
                      {isAdmin && t.user?.email && (
                        <span className="block text-xs text-slate-400 font-normal">{t.user.email}</span>
                      )}
                    </td>
                    <td className="py-4 text-slate-600 text-sm">{t.description || '-'}</td>
                    <td className={cn(
                      "py-4 text-right pr-4 text-sm font-bold",
                      t.type === 'INCOME' ? "text-blue-600" : "text-orange-600"
                    )}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    {isAdmin && (
                      <td className="py-4 text-right pr-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEdit(t)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(t.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-slate-400">
                  {transactions.length === 0 ? "등록된 내역이 없습니다. 위 양식을 통해 추가해주세요." : "검색 결과가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-center gap-2">
          <Link
            href={`/ledger?page=${Math.max(1, currentPage - 1)}`}
            className={cn(
              "p-2 rounded-lg transition-colors",
              currentPage === 1 ? "text-slate-300 pointer-events-none" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/ledger?page=${page}`}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  currentPage === page
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {page}
              </Link>
            ))}
          </div>

          <Link
            href={`/ledger?page=${Math.min(totalPages, currentPage + 1)}`}
            className={cn(
              "p-2 rounded-lg transition-colors",
              currentPage === totalPages ? "text-slate-300 pointer-events-none" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
