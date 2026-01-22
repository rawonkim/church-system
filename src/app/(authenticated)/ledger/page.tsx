import { getTransactions, getUsers, getSession } from "@/app/actions";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { TransactionList } from "@/components/TransactionList";

export default async function LedgerPage(props: { searchParams?: Promise<any> }) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  
  const page = Number(searchParams?.page) || 1;
  const { transactions, totalPages } = await getTransactions(page);
  const users = await getUsers();
  
  const isAdmin = session?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">회계 장부</h1>
        <p className="text-slate-500 mt-2">
          {isAdmin 
            ? "모든 수입과 지출 내역을 관리합니다." 
            : "나의 헌금 내역을 확인합니다."}
        </p>
      </div>

      {isAdmin && <AddTransactionForm users={users} />}

      <TransactionList 
        transactions={transactions} 
        users={users} 
        isAdmin={isAdmin} 
        initialFilter={{
          type: searchParams?.type || '',
          dateStart: searchParams?.dateStart || '',
          dateEnd: searchParams?.dateEnd || '',
          category: '',
          userName: '',
          description: ''
        }}
        totalPages={totalPages}
        currentPage={page}
      />
    </div>
  );
}
