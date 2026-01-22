import { getSummaryStats, getTransactions, getSession } from "@/app/actions";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle, Wallet, Calendar, FileText } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();
  const stats = await getSummaryStats();
  const { transactions: recentTransactions } = await getTransactions(1, 5);
  
  const isAdmin = session?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {isAdmin ? "교회 재정 대시보드" : "나의 헌금 현황"}
          </h1>
          <p className="text-slate-500 mt-2">
            {isAdmin 
              ? "오늘의 교회 재정 현황입니다." 
              : `${session?.name} 성도님의 헌금 기록입니다.`}
          </p>
        </div>
        <div className="flex gap-3">
          {!isAdmin && (
            <Link 
              href="/receipt"
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl hover:bg-slate-800 transition-colors font-medium shadow-sm text-sm"
            >
              <FileText className="w-4 h-4" />
              기부금 영수증 (PDF)
            </Link>
          )}
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
            <span className="text-sm font-medium text-slate-600">
              오늘 날짜: {formatDate(new Date())}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href={`/ledger?type=INCOME&dateStart=${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]}&dateEnd=${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]}`}>
          <StatCard
            title="이번 달 헌금"
            amount={stats.income}
            icon={ArrowUpCircle}
            color="text-blue-600"
            bg="bg-blue-50"
          />
        </Link>
        
        {isAdmin ? (
          <Link href={`/ledger?type=EXPENSE&dateStart=${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]}&dateEnd=${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]}`}>
            <StatCard
              title="이번 달 지출"
              amount={stats.expense}
              icon={ArrowDownCircle}
              color="text-orange-600"
              bg="bg-orange-50"
            />
          </Link>
        ) : (
          <StatCard
            title="올해 누적 헌금"
            amount={stats.balance} // For members, balance is used as total income
            icon={Calendar}
            color="text-purple-600"
            bg="bg-purple-50"
          />
        )}

        {isAdmin && (
          <StatCard
            title="현재 잔액"
            amount={stats.balance}
            icon={Wallet}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">
          {isAdmin ? "최근 재정 활동" : "최근 헌금 내역"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-sm">
                <th className="pb-3 pl-4">날짜</th>
                <th className="pb-3">구분</th>
                <th className="pb-3">카테고리</th>
                <th className="pb-3">내용</th>
                <th className="pb-3 text-right pr-4">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTransactions.map((t) => (
                <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-4 text-slate-600 text-sm">{formatDate(t.date)}</td>
                  <td className="py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      t.type === 'INCOME' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {t.type === 'INCOME' ? '헌금' : '지출'}
                    </span>
                  </td>
                  <td className="py-4 text-slate-700 text-sm font-medium">{t.category}</td>
                  <td className="py-4 text-slate-600 text-sm">{t.description || '-'}</td>
                  <td className={cn(
                    "py-4 text-right pr-4 text-sm font-bold",
                    t.type === 'INCOME' ? "text-blue-600" : "text-orange-600"
                  )}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    아직 기록된 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-200">
      <div className={cn("p-4 rounded-2xl", bg)}>
        <Icon className={cn("w-8 h-8", color)} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{formatCurrency(amount)}</p>
      </div>
    </div>
  );
}
