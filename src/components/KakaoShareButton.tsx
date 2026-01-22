'use client'

import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

declare global {
  interface Window {
    Kakao: any;
  }
}

export function KakaoShareButton({ user }: { user: any }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
      // Initialize Kakao SDK with environment variable
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
      if (kakaoKey && kakaoKey !== "여기에_발급받은_키를_넣으세요") {
        window.Kakao.init(kakaoKey);
      } else {
        console.warn('Kakao JS Key is missing in .env');
      }
    }
  }, []);

  const handleShare = () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert('카카오톡 연동 설정이 필요합니다. 관리자에게 문의하세요. (API Key 미설정)');
      return;
    }

    const receiptUrl = `${window.location.origin}/receipt?id=${user.id}`; // In real app, use secure token

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '교회 기부금 영수증 발급 안내',
        description: `${user.name} 성도님, ${new Date().getFullYear()}년도 기부금 영수증이 발급되었습니다. 국세청 홈택스에도 자동 등록되었으니 확인해보세요!`,
        // imageUrl: 카카오톡 메시지에 뜰 이미지입니다. 교회 로고나 영수증 관련 이미지를 넣으세요. (권장 사이즈: 800x400)
        imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80', // 예시: 교회/십자가 관련 무료 이미지
        link: {
          mobileWebUrl: receiptUrl,
          webUrl: receiptUrl,
        },
      },
      buttons: [
        {
          title: '영수증 확인하기',
          link: {
            mobileWebUrl: receiptUrl,
            webUrl: receiptUrl,
          },
        },
      ],
    });
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-[#FEE500] text-[#3A1D1D] px-3 py-1.5 rounded-lg hover:bg-[#FDD835] transition-colors font-bold shadow-sm"
    >
      <MessageCircle className="w-4 h-4 fill-[#3A1D1D] stroke-none" />
      <span className="text-xs">알림톡</span>
    </button>
  );
}
