'use client'

import { useState } from 'react'
import type { BusinessInfo } from '@/app/page'

const CATEGORIES = [
  '인테리어/시공', '음식점/카페', '미용/뷰티', '자동차/정비',
  '교육/학원', '병원/의료', '부동산', '법률/세무',
  '청소/이사', '반려동물', '꽃/플라워', '기타',
]

const TONES = [
  { value: 'friendly', label: '친근한 이웃 느낌', desc: '"오늘도 현장 다녀왔어요~"' },
  { value: 'professional', label: '전문가 느낌', desc: '"10년 경력의 노하우를 공유합니다"' },
  { value: 'casual', label: '편안한 일상 느낌', desc: '"요즘 이런 문의가 많더라구요"' },
]

type Props = {
  onComplete: (info: BusinessInfo) => void
  isModal?: boolean
  defaultValues?: BusinessInfo | null
}

export default function BusinessSetup({ onComplete, isModal, defaultValues }: Props) {
  const [form, setForm] = useState<BusinessInfo>({
    name: defaultValues?.name || '',
    category: defaultValues?.category || '',
    region: defaultValues?.region || '',
    strengths: defaultValues?.strengths || '',
    tone: defaultValues?.tone || 'friendly',
  })

  const isValid = form.name && form.category && form.region && form.strengths

  const handleSubmit = () => {
    if (!isValid) return
    // localStorage에 저장
    localStorage.setItem('businessInfo', JSON.stringify(form))
    onComplete(form)
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm bg-white transition-all"

  return (
    <div className={isModal ? 'p-6' : 'max-w-lg mx-auto px-4 pt-16'}>
      {!isModal && (
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">글</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-dark)] mb-2">글써주는집</h1>
          <p className="text-gray-500 text-sm">사진만 올리면 블로그 글이 뚝딱</p>
        </div>
      )}

      <div className="space-y-4">
        {/* 업체명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">업체명 (또는 닉네임)</label>
          <input
            type="text"
            placeholder="예: 홍길동 인테리어"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>

        {/* 업종 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">업종</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setForm({ ...form, category: cat })}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  form.category === cat
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-white text-gray-600 border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 지역 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">주요 활동 지역</label>
          <input
            type="text"
            placeholder="예: 서울 강남구, 경기 수원시"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            className={inputClass}
          />
        </div>

        {/* 강점 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">우리 업체의 강점</label>
          <textarea
            placeholder="예: 20년 경력, 합리적인 가격, A/S 보장, 친절한 상담 등"
            value={form.strengths}
            onChange={(e) => setForm({ ...form, strengths: e.target.value })}
            rows={3}
            className={inputClass + ' resize-none'}
          />
          <p className="text-xs text-gray-400 mt-1">쉼표로 구분해서 여러 개 적어주세요</p>
        </div>

        {/* 글 톤 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">원하는 글 느낌</label>
          <div className="space-y-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => setForm({ ...form, tone: t.value })}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  form.tone === t.value
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                    : 'border-[var(--color-border)] hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium text-[var(--color-dark)]">{t.label}</span>
                <span className="text-xs text-gray-400 ml-2">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all mt-4 ${
            isValid
              ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isModal ? '저장하기' : '시작하기'}
        </button>
      </div>
    </div>
  )
}
