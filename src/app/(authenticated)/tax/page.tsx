import { getTaxData } from "@/app/actions";
import { ExcelDownloadButton } from "@/components/ExcelDownloadButton";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function TaxPage() {
  const donations = await getTaxData();
  
  // Group by User for display
  const summaryByUser: Record<string, number> = {};
  donations.forEach((d: any) => {
    // Mask resident ID for display key
    const maskedId = d.residentId ? d.residentId.substring(0, 8) + "******" : '';
    const key = `${d.name} (${maskedId})`;
    summaryByUser[key] = (summaryByUser[key] || 0) + d.amount;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">연말정산 관리</h1>
          <p className="text-slate-500 mt-2">교인별 기부금 내역을 확인하고 엑셀로 다운로드하세요.</p>
        </div>
        <ExcelDownloadButton data={donations} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">교인별 합계</h2>
          <div className="space-y-3">
            {Object.entries(summaryByUser).map(([name, total]) => (
              <div key={name} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                <span className="font-medium text-slate-700">{name}</span>
                <span className="font-bold text-slate-900">{formatCurrency(total)}</span>
              </div>
            ))}
            {Object.keys(summaryByUser).length === 0 && (
              <p className="text-slate-400 text-center py-4">데이터가 없습니다.</p>
            )}
          </div>
        </div>

        {/* Detailed List Preview */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-96 overflow-y-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-4">상세 내역 미리보기</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-2">날짜</th>
                <th className="pb-2">이름</th>
                <th className="pb-2 text-right">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {donations.map((d: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-2 text-slate-600">{d.date}</td>
                  <td className="py-2 text-slate-800 font-medium">{d.name}</td>
                  <td className="py-2 text-right text-slate-600">{formatCurrency(d.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
