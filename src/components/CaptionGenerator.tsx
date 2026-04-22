'use client'

import { useState } from 'react'
import type { BusinessInfo } from '@/app/page'

const CAPTION_TYPES = [
  { value: 'hook', label: '후킹형', desc: '"이 가격에 이 퀄리티?" 시선 끄는 스타일' },
  { value: 'story', label: '스토리형', desc: '작업 과정이나 에피소드를 풀어내는 스타일' },
  { value: 'tip', label: '정보/팁형', desc: '"꼭 알아야 할 3가지" 유용한 정보 스타일' },
  { value: 'before-after', label: '비포애프터형', desc: '변화를 보여주는 스타일' },
]

export default function CaptionGenerator({ businessInfo, apiKey }: { businessInfo: BusinessInfo; apiKey: string }) {
  const [captionType, setCaptionType] = useState('hook')
  const [subject, setSubject] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!subject.trim()) return
    setLoading(true)
    setResult('')
    setCopied(false)

    try {
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessInfo, captionType, subject, apiKey }),
      })

      if (!res.ok) {
        let errorMsg = '생성에 실패했습니다'
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const err = await res.json()
          errorMsg = err.error || errorMsg
        } else {
          errorMsg = `서버 오류 (${res.status}): 잠시 후 다시 시도해주세요.`
        }
        throw new Error(errorMsg)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          setResult((prev) => prev + chunk)
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
      setResult('오류: ' + message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* 캡션 유형 */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-dark)] mb-3">캡션 스타일</label>
        <div className="grid grid-cols-2 gap-2">
          {CAPTION_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setCaptionType(t.value)}
              className={`text-left px-4 py-3 rounded-xl border transition-all ${
                captionType === t.value
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                  : 'border-[var(--color-border)] hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 주제 입력 */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-dark)] mb-1.5">릴스 주제</label>
        <textarea
          placeholder="예: 오늘 시공한 강남 아파트 욕실, 신메뉴 수제버거 만드는 과정, 네일아트 시술 영상"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">영상에 담긴 내용을 간단히 적어주세요</p>
      </div>

      {/* 생성 버튼 */}
      <button
        onClick={handleGenerate}
        disabled={loading || !subject.trim()}
        className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
          loading || !subject.trim()
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:scale-[0.98]'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="ml-2">캡션 쓰는 중...</span>
          </span>
        ) : (
          '릴스 캡션 생성하기'
        )}
      </button>

      {/* 결과 */}
      {result && (
        <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-gray-bg)] border-b border-[var(--color-border)]">
            <span className="text-sm font-semibold text-[var(--color-dark)]">생성된 캡션</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
            >
              {copied ? '✓ 복사됨' : '복사하기'}
            </button>
          </div>
          <div className="p-5 whitespace-pre-wrap text-sm leading-relaxed">
            {result}
          </div>
        </div>
      )}
    </div>
  )
}
