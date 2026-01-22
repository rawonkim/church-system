import { getAuditLogs } from "@/app/actions";
import { cn } from "@/lib/utils";
import { ShieldAlert, Activity } from "lucide-react";

export const dynamic = 'force-dynamic';

const ACTION_MAP: Record<string, string> = {
  'CREATE': '등록',
  'UPDATE': '수정',
  'DELETE': '삭제',
  'BULK_CREATE': '일괄등록'
};

const ENTITY_MAP: Record<string, string> = {
  'User': '교인',
  'Transaction': '헌금/지출'
};

export default async function AuditLogPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-blue-600" />
          감사 로그 (Audit Log)
        </h1>
        <p className="text-slate-500 mt-2">
          데이터의 생성, 수정, 삭제 이력을 추적합니다. (최근 1,000건)
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="py-4 pl-6 w-[200px] whitespace-nowrap">일시</th>
                <th className="py-4 w-[120px] whitespace-nowrap">작업자</th>
                <th className="py-4 w-[100px] whitespace-nowrap">종류</th>
                <th className="py-4 pr-6 min-w-[300px]">상세 내용</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log: any) => (
                <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-6 text-slate-500 text-sm font-mono">
                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                  </td>
                  <td className="py-4 text-slate-800 font-medium text-sm">
                    {log.performedBy}
                  </td>
                  <td className="py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-bold border",
                      log.action === 'CREATE' && "bg-green-50 text-green-600 border-green-100",
                      log.action === 'UPDATE' && "bg-blue-50 text-blue-600 border-blue-100",
                      log.action === 'DELETE' && "bg-red-50 text-red-600 border-red-100",
                      log.action === 'BULK_CREATE' && "bg-purple-50 text-purple-600 border-purple-100"
                    )}>
                      {ACTION_MAP[log.action] || log.action}
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-slate-600 text-sm break-all">
                    {log.details}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>기록된 로그가 없습니다.</p>
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
