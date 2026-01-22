'use client'

import { addTransaction, addBulkTransactions } from "@/app/actions";
import { PlusCircle, Search, Trash2, Plus, Users } from "lucide-react";
import { useRef, useState } from "react";

export const OFFERING_CATEGORIES = [
  "주정헌금 (주일헌금)",
  "십일조",
  "감사헌금",
  "절기헌금 (부활절, 추수감사절, 성탄절 등)",
  "선교헌금",
  "건축헌금",
  "기타헌금 (직접 입력)"
];

export const EXPENSE_CATEGORIES = [
  "선택하세요",
  "사례비 (목회자 급여)",
  "시설비 (전기/수도/관리비 등)",
  "교육비",
  "선교비",
  "구제비",
  "행사비",
  "기타지출 (직접 입력)"
];

export function AddTransactionForm({ users = [] }: { users?: any[] }) {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  
  // Single Mode State
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedType, setSelectedType] = useState("INCOME");
  const [selectedCategory, setSelectedCategory] = useState(OFFERING_CATEGORIES[0]);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Bulk Mode State
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkItems, setBulkItems] = useState([
    { id: 1, userId: '', userName: '', amount: '', category: OFFERING_CATEGORIES[0], description: '' }
  ]);
  const [bulkSearchTerms, setBulkSearchTerms] = useState<{[key: number]: string}>({});
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState<number | null>(null);

  const filteredUsers = (term: string) => users.filter(u => 
    u.name.includes(term) || 
    (u.phoneNumber && u.phoneNumber.includes(term))
  );

  const addBulkItem = () => {
    const newItem = { 
      id: Date.now(), 
      userId: '', 
      userName: '', 
      amount: '', 
      category: OFFERING_CATEGORIES[0], 
      description: '' 
    };
    setBulkItems([...bulkItems, newItem]);
  };

  const removeBulkItem = (id: number) => {
    if (bulkItems.length > 1) {
      setBulkItems(bulkItems.filter(item => item.id !== id));
      const newSearchTerms = { ...bulkSearchTerms };
      delete newSearchTerms[id];
      setBulkSearchTerms(newSearchTerms);
    }
  };

  const updateBulkItem = (id: number, field: string, value: string) => {
    setBulkItems(bulkItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleBulkSubmit = async () => {
    // Validate
    const validItems = bulkItems.filter(item => item.amount && parseInt(item.amount) > 0);
    if (validItems.length === 0) {
      alert('최소 1개 이상의 유효한 헌금 내역을 입력해주세요.');
      return;
    }

    // Check for "선택하세요"
    const invalidCategoryItems = validItems.filter(item => item.category === "선택하세요");
    if (invalidCategoryItems.length > 0) {
      alert('모든 항목의 카테고리를 선택해주세요.');
      return;
    }

    if (!confirm(`${validItems.length}건의 헌금 내역을 등록하시겠습니까?`)) return;

    const formData = new FormData();
    formData.append('date', bulkDate);
    formData.append('items', JSON.stringify(validItems));

    await addBulkTransactions(formData);
    
    // Reset
    setBulkItems([{ id: Date.now(), userId: '', userName: '', amount: '', category: OFFERING_CATEGORIES[0], description: '' }]);
    setBulkSearchTerms({});
    alert('등록되었습니다.');
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {activeTab === 'single' ? <PlusCircle className="w-5 h-5 text-primary" /> : <Users className="w-5 h-5 text-primary" />}
          {activeTab === 'single' ? '새로운 내역 추가' : '헌금 일괄 등록 (여러 명)'}
        </h3>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'single' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            개별 등록
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'bulk' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            일괄 등록
          </button>
        </div>
      </div>

      {activeTab === 'single' ? (
        <form 
          ref={formRef}
          action={async (formData) => {
            if (selectedType === 'EXPENSE' && selectedExpenseCategory === '선택하세요') {
              alert('지출 카테고리를 선택해주세요.');
              return;
            }
            await addTransaction(formData);
            formRef.current?.reset();
            setSelectedCategory(OFFERING_CATEGORIES[0]);
            setSelectedExpenseCategory(EXPENSE_CATEGORIES[0]);
            setSelectedUser("");
            setUserSearchTerm("");
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">날짜</label>
            <input 
              type="date" 
              name="date" 
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">구분</label>
            <select 
              name="type" 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
            >
              <option value="INCOME">헌금 (수입)</option>
              <option value="EXPENSE">지출</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">카테고리</label>
            {selectedType === 'INCOME' ? (
              <div className="space-y-2">
                <select 
                  name={selectedCategory === "기타헌금 (직접 입력)" ? "category_select" : "category"}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  {OFFERING_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {selectedCategory === "기타헌금 (직접 입력)" && (
                  <input 
                    type="text" 
                    name="category" 
                    placeholder="헌금 종류 입력"
                    required
                    className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <select 
                  name={selectedExpenseCategory === "기타지출 (직접 입력)" ? "category_select" : "category"}
                  value={selectedExpenseCategory}
                  onChange={(e) => setSelectedExpenseCategory(e.target.value)}
                  className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {selectedExpenseCategory === "기타지출 (직접 입력)" && (
                  <input 
                    type="text" 
                    name="category" 
                    placeholder="지출 항목 입력"
                    required
                    className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                )}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">금액</label>
            <input 
              type="number" 
              name="amount" 
              placeholder="0"
              required
              className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-slate-500 ml-1">교인 (검색)</label>
            <input type="hidden" name="userId" value={selectedUser} />
            <div className="relative">
              <input
                type="text"
                placeholder="이름 검색"
                value={userSearchTerm}
                onChange={(e) => {
                  setUserSearchTerm(e.target.value);
                  setIsUserDropdownOpen(true);
                  if (!e.target.value) setSelectedUser("");
                }}
                onFocus={() => setIsUserDropdownOpen(true)}
                className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            {isUserDropdownOpen && userSearchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-100 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                {filteredUsers(userSearchTerm).length > 0 ? (
                  filteredUsers(userSearchTerm).map(u => (
                    <div
                      key={u.id}
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedUser(u.id);
                        setUserSearchTerm(u.name);
                        setIsUserDropdownOpen(false);
                      }}
                    >
                      <span className="font-medium text-slate-800">{u.name}</span>
                      <span className="text-xs text-slate-500 ml-2">{u.phoneNumber || '전화번호 없음'}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-400 text-center">검색 결과 없음</div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">내용 (선택)</label>
            <input 
              type="text" 
              name="description" 
              placeholder="상세 내용"
              className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-6 flex justify-end mt-2">
            <button 
              type="submit"
              className="bg-slate-900 text-white px-6 py-2 rounded-2xl hover:bg-slate-800 transition-colors font-medium"
            >
              추가하기
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <label className="text-sm font-semibold text-slate-600">등록 기준일:</label>
            <input 
              type="date" 
              value={bulkDate}
              onChange={(e) => setBulkDate(e.target.value)}
              className="h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
            />
            <span className="text-xs text-slate-400 ml-auto">* 모든 항목이 이 날짜로 등록됩니다.</span>
          </div>

          <div className="space-y-3">
            {bulkItems.map((item, idx) => (
              <div key={item.id} className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-2 p-2 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-8 flex items-center justify-center text-slate-400 font-bold text-sm">
                  {idx + 1}
                </div>
                
                {/* 교인 검색 */}
                <div className="relative w-[120px] flex-none">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="이름"
                      value={bulkSearchTerms[item.id] || item.userName}
                      onChange={(e) => {
                        setBulkSearchTerms({...bulkSearchTerms, [item.id]: e.target.value});
                        setBulkDropdownOpen(item.id);
                        if (!e.target.value) updateBulkItem(item.id, 'userId', '');
                      }}
                      onFocus={() => setBulkDropdownOpen(item.id)}
                      className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-center bg-white"
                    />
                  </div>
                  
                  {bulkDropdownOpen === item.id && bulkSearchTerms[item.id] && (
                    <div className="absolute z-10 w-[180px] mt-1 bg-white border border-slate-100 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredUsers(bulkSearchTerms[item.id]).length > 0 ? (
                        filteredUsers(bulkSearchTerms[item.id]).map(u => (
                          <div
                            key={u.id}
                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                            onClick={() => {
                              updateBulkItem(item.id, 'userId', u.id);
                              updateBulkItem(item.id, 'userName', u.name);
                              setBulkSearchTerms({...bulkSearchTerms, [item.id]: u.name});
                              setBulkDropdownOpen(null);
                            }}
                          >
                            <span className="font-medium text-slate-800">{u.name}</span>
                            <span className="text-xs text-slate-500 ml-2">{u.phoneNumber || '번호없음'}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-400 text-center">검색 결과 없음</div>
                      )}
                    </div>
                  )}
                </div>

                {/* 카테고리 */}
                <div className="w-[140px] flex-none">
                  <select 
                    value={item.category}
                    onChange={(e) => updateBulkItem(item.id, 'category', e.target.value)}
                    className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm truncate"
                  >
                    {OFFERING_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* 금액 */}
                <div className="w-[120px] flex-none">
                  <input 
                    type="number" 
                    placeholder="금액"
                    value={item.amount}
                    onChange={(e) => updateBulkItem(item.id, 'amount', e.target.value)}
                    className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-right bg-white"
                  />
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-[150px]">
                  <input 
                    type="text" 
                    placeholder="내용 (선택)"
                    value={item.description}
                    onChange={(e) => updateBulkItem(item.id, 'description', e.target.value)}
                    className="w-full h-[42px] px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                  />
                </div>

                {/* 삭제 버튼 */}
                <div className="w-10 flex justify-center">
                  <button
                    onClick={() => removeBulkItem(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={addBulkItem}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              줄 추가하기
            </button>
            <button
              onClick={handleBulkSubmit}
              className="bg-slate-900 text-white px-6 py-2 rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-900/10 text-center text-sm"
            >
              일괄 등록 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
