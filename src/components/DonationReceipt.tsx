'use client'

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DonationReceipt({ data }: { data: any }) {
  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `기부금영수증_${data.user.name}_${data.year}`,
  });

  if (!data) return <div>데이터가 없습니다.</div>;

  // Mask resident ID for display/print (default: masked)
  // But for PDF download, usually unmasked version is preferred by tax office if submitted directly?
  // Actually, for personal submission, full ID is required.
  // We should show full ID on the receipt itself.
  
  // Note: The data passed here already has decrypted residentId.
  // We will display it as is (Full ID is needed for official receipt).

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-end">
        <button
          onClick={() => handlePrint()}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-colors font-medium shadow-sm"
        >
          <Printer className="w-5 h-5" />
          PDF로 인쇄 / 다운로드
        </button>
      </div>

      <div className="bg-white p-8 shadow-sm border border-slate-200 print:p-0 print:border-0 print:shadow-none max-w-[210mm] mx-auto" ref={componentRef} id="print-content">
        <div className="border-2 border-black p-8 h-[297mm] relative flex flex-col justify-between print:border-2">
          
          {/* Header */}
          <div>
            <div className="flex justify-between items-end mb-2 border-b-2 border-black pb-2">
               <span className="text-sm">소득세법 시행규칙 [별지 제45호의2서식]</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-center my-8 tracking-widest border-2 border-black py-4">
              기 부 금 영 수 증
            </h1>
            
            <div className="flex justify-between mb-4 px-2">
               <span className="text-sm">일련번호 : {new Date().getFullYear()}-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-0 border-t-2 border-black">
            {/* 1. 기부자 정보 */}
            <div className="flex border-b border-black">
              <div className="w-8 bg-slate-100 flex items-center justify-center border-r border-black font-bold text-sm py-4 text-center whitespace-pre-wrap">기{"\n"}부{"\n"}자</div>
              <div className="flex-1">
                <div className="flex border-b border-black">
                  <div className="w-24 bg-slate-50 p-2 border-r border-black text-center text-sm flex items-center justify-center font-bold">성 명</div>
                  <div className="flex-1 p-2 text-sm flex items-center">{data.user.name}</div>
                  <div className="w-32 bg-slate-50 p-2 border-l border-r border-black text-center text-sm flex items-center justify-center font-bold">주민등록번호</div>
                  <div className="flex-1 p-2 text-sm flex items-center">{data.user.residentId}</div>
                </div>
                <div className="flex">
                  <div className="w-24 bg-slate-50 p-2 border-r border-black text-center text-sm flex items-center justify-center font-bold">주 소</div>
                  <div className="flex-1 p-2 text-sm flex items-center">{data.user.address || '주소 미등록'}</div>
                </div>
              </div>
            </div>

            {/* 2. 기부금 단체 */}
             <div className="flex border-b border-black">
              <div className="w-8 bg-slate-100 flex items-center justify-center border-r border-black font-bold text-sm py-4 text-center whitespace-pre-wrap">기{"\n"}부{"\n"}금{"\n"}단{"\n"}체</div>
              <div className="flex-1">
                <div className="flex border-b border-black">
                  <div className="w-24 bg-slate-50 p-2 border-r border-black text-center text-sm flex items-center justify-center font-bold">단 체 명</div>
                  <div className="flex-1 p-2 text-sm flex items-center">OO교회</div>
                  <div className="w-32 bg-slate-50 p-2 border-l border-r border-black text-center text-sm flex items-center justify-center font-bold">사업자등록번호</div>
                  <div className="flex-1 p-2 text-sm flex items-center">000-00-00000</div>
                </div>
                <div className="flex border-b border-black">
                  <div className="w-24 bg-slate-50 p-2 border-r border-black text-center text-sm flex items-center justify-center font-bold">소 재 지</div>
                  <div className="flex-1 p-2 text-sm flex items-center">OO시 OO구 OO로 123</div>
                </div>
                 <div className="flex">
                  <div className="w-24 bg-slate-50 p-2 border-r border-black text-center text-sm flex items-center justify-center font-bold">기부금유형</div>
                  <div className="flex-1 p-2 text-sm flex items-center">종교단체기부금 (코드: 41)</div>
                </div>
              </div>
            </div>

            {/* 3. 기부 내역 (요약) */}
             <div className="flex border-b-2 border-black flex-1">
              <div className="w-8 bg-slate-100 flex items-center justify-center border-r border-black font-bold text-sm py-4 text-center whitespace-pre-wrap">기{"\n"}부{"\n"}내{"\n"}용</div>
              <div className="flex-1 flex flex-col">
                 {/* 합계 */}
                <div className="flex border-b border-black bg-slate-50">
                   <div className="flex-1 p-2 text-center text-sm font-bold border-r border-black">년 월</div>
                   <div className="flex-[2] p-2 text-center text-sm font-bold border-r border-black">내 용 (적 요)</div>
                   <div className="flex-1 p-2 text-center text-sm font-bold">금 액</div>
                </div>
                
                 {/* 상세 내역 (최대 12줄) */}
                <div className="flex-1">
                    {/* 합계 행 */}
                     <div className="flex border-b border-slate-300 bg-slate-50/50">
                        <div className="flex-1 p-2 text-center text-sm font-bold border-r border-slate-300">합 계</div>
                        <div className="flex-[2] p-2 text-center text-sm border-r border-slate-300"></div>
                        <div className="flex-1 p-2 text-right text-sm font-bold">{formatCurrency(data.totalAmount)}</div>
                     </div>

                    {data.transactions.slice(0, 12).map((t: any, idx: number) => (
                      <div key={idx} className="flex border-b border-slate-200">
                        <div className="flex-1 p-1.5 text-center text-sm border-r border-slate-200">{t.date.substring(0, 7)}</div>
                        <div className="flex-[2] p-1.5 text-center text-sm border-r border-slate-200">{t.category}</div>
                        <div className="flex-1 p-1.5 text-right text-sm">{formatCurrency(t.amount)}</div>
                      </div>
                    ))}
                    
                    {data.transactions.length > 12 && (
                       <div className="flex border-b border-slate-200">
                        <div className="flex-1 p-1.5 text-center text-sm border-r border-slate-200">...</div>
                        <div className="flex-[2] p-1.5 text-center text-sm border-r border-slate-200 text-slate-500 italic">...외 {data.transactions.length - 12}건</div>
                        <div className="flex-1 p-1.5 text-right text-sm"></div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center pb-12">
            <p className="text-base mb-8 leading-loose">
              「소득세법」 제34조, 「조세특례제한법」 제76조ㆍ제88조의4 및 「법인세법」 제24조에 따라<br/>
              위와 같이 기부금을 기부하였음을 증명합니다.
            </p>
            <p className="text-lg font-bold mb-12">{new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일</p>
            
            <div className="flex flex-col items-center relative">
              <div className="flex items-center gap-4 mb-2">
                 <span className="text-lg font-bold">기 부 금 수 령 인</span>
                 <span className="text-xl font-bold tracking-widest ml-4">OO교회</span>
              </div>
              
              {/* 직인 이미지 */}
              <div className="relative mt-2">
                <div className="w-20 h-20 flex items-center justify-center">
                   <span className="absolute right-[-40px] top-1/2 -translate-y-1/2 font-bold text-lg">(인)</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/file.svg" 
                    alt="직인" 
                    className="w-full h-full object-contain absolute top-0 left-0 z-20 mix-blend-multiply opacity-80"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                  <div className="w-16 h-16 border-2 border-red-500 rounded-full flex items-center justify-center text-red-500 font-bold opacity-50 rotate-[-15deg] absolute top-1 left-1 -z-10">
                    (인)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content, #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
