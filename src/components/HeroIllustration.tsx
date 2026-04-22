'use client'

export default function HeroIllustration() {
  return (
    <div className="relative w-64 h-52 mx-auto mb-6">
      {/* 배경 그라데이션 원 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-44 h-44 rounded-full bg-gradient-to-br from-[#FFF3EE] to-[#FFE4D6] opacity-80" />
      </div>

      {/* 메인 블로그 카드 */}
      <div className="absolute left-8 top-6 w-48 bg-white rounded-2xl shadow-lg border border-[#F0F0F0] p-4 transform -rotate-2">
        {/* 카드 상단 - 블로그 헤더 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="h-2 bg-[var(--color-dark)] rounded-full w-20 opacity-70" />
          </div>
        </div>
        {/* 이미지 영역 */}
        <div className="w-full h-16 rounded-lg bg-gradient-to-br from-[#FFD4C0] to-[#FFBDA0] mb-2 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E85D2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        </div>
        {/* 텍스트 라인 */}
        <div className="space-y-1.5">
          <div className="h-1.5 bg-gray-200 rounded-full w-full" />
          <div className="h-1.5 bg-gray-200 rounded-full w-4/5" />
          <div className="h-1.5 bg-gray-200 rounded-full w-3/5" />
        </div>
      </div>

      {/* 사진 아이콘 (왼쪽 하단) */}
      <div className="absolute left-0 bottom-2 w-14 h-14 bg-white rounded-xl shadow-md border border-[#F0F0F0] flex items-center justify-center transform rotate-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>

      {/* 화살표 (사진 → 글) */}
      <div className="absolute right-6 top-3 text-[var(--color-primary)]">
        <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
          <path d="M4 18 C10 18, 14 6, 24 6" stroke="#FF6B35" strokeWidth="2" strokeDasharray="4 3" fill="none" strokeLinecap="round" />
          <path d="M21 3 L25 6 L21 9" stroke="#FF6B35" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* AI 뱃지 (오른쪽) */}
      <div className="absolute right-2 bottom-8 bg-[var(--color-primary)] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md transform rotate-3">
        AI 글쓰기
      </div>

      {/* 체크 뱃지 (오른쪽 상단) */}
      <div className="absolute right-4 top-14 w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center shadow-md">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20,6 9,17 4,12" />
        </svg>
      </div>
    </div>
  )
}
