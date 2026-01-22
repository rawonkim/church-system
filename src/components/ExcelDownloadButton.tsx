'use client'

import * as XLSX from 'xlsx';
import { Download, Loader2, Check } from 'lucide-react';
import { useState } from 'react';

export function ExcelDownloadButton({ data }: { data: any[] }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setIsCompleted(false);
      
      // Small delay to ensure UI updates and browser is ready
      await new Promise(resolve => setTimeout(resolve, 500));

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
      const fileName = `연말정산_기부금명세서_${new Date().toISOString().slice(0,10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      // Success feedback
      setIsCompleted(true);
      setTimeout(() => setIsCompleted(false), 3000);
      
      // Fallback for strict mobile browsers: create a direct link if needed
      // (XLSX.writeFile usually works, but just in case)

    } catch (error) {
      console.error('Excel download failed:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
          isCompleted 
            ? 'bg-green-700 text-white' 
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>다운로드 중...</span>
          </>
        ) : isCompleted ? (
          <>
            <Check className="w-4 h-4" />
            <span>완료!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>엑셀 다운로드 (홈택스용)</span>
          </>
        )}
      </button>
      {/* Helper text for mobile users */}
      <p className="text-xs text-slate-500 pl-1 md:hidden">
        * 다운로드가 안 되면 브라우저 설정을 확인하세요.
      </p>
    </div>
  );
}
