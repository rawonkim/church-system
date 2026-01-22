'use client'

import { Download, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

export function ExcelDownloadButton({ data }: { data: any[] }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleDownload = () => {
    setIsDownloading(true);
    // Use form submission for reliable file download on mobile
    if (formRef.current) {
      formRef.current.submit();
    }
    // Reset loading state after a short delay (since we can't know when download finishes with form submit)
    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <form ref={formRef} action="/api/excel" method="POST" target="_self">
        <input type="hidden" name="data" value={JSON.stringify(data)} />
      </form>
      
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
      
      {/* Helper text for mobile users */}
      <p className="text-xs text-slate-500 pl-1 md:hidden">
        * 다운로드가 안 되면 '파일' 앱을 확인하세요.
      </p>
    </div>
  );
}
