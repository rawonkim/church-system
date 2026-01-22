import { getDonationReceiptData } from "@/app/actions";
import DonationReceipt from "@/components/DonationReceipt";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ReceiptPage() {
  const data = await getDonationReceiptData();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-slate-500 mb-4">로그인이 필요하거나 데이터가 없습니다.</p>
        <Link href="/" className="text-blue-600 hover:underline">홈으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">기부금 영수증 발급</h1>
          <p className="text-slate-500 mt-2">
            {data.year}년도 기부 내역에 대한 영수증을 확인하고 출력합니다.
          </p>
        </div>
      </div>

      <DonationReceipt data={data} />
    </div>
  );
}
