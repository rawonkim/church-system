'use client'

import * as XLSX from 'xlsx';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function ExcelDownloadButton({ data }: { data: any[] }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));

      // 1. Create a new workbook
      const wb = XLSX.utils.book_new();

      // 2. Format data
      const wsData = [
        ['일련번호', '기부일자', '성명', '주민등록번호', '주소', '유형코드', '기부금액', '적요'],
        ...data.map((d, idx) => [
          idx + 1,
          d.date,
          d.name,
          d.residentId,
          d.address,
          d.type,
          d.amount,
          d.category
        ])
      ];

      // 3. Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      ws['!cols'] = [
        { wch: 10 }, // 일련번호
        { wch: 15 }, // 기부일자
        { wch: 10 }, // 성명
        { wch: 20 }, // 주민등록번호
        { wch: 30 }, // 주소
        { wch: 10 }, // 유형코드
        { wch: 15 }, // 기부금액
        { wch: 20 }, // 적요
      ];

      // 4. Append worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "기부금명세서");

      // 5. Download
      XLSX.writeFile(wb, `연말정산_기부금명세서_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (error) {
      console.error('Excel download failed:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-2xl hover:bg-green-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      엑셀 다운로드 (홈택스용)
    </button>
  );
}
