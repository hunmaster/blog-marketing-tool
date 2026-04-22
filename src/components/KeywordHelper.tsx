'use client'

import { useState } from 'react'
import type { BusinessInfo } from '@/app/page'

export default function KeywordHelper({ businessInfo }: { businessInfo: BusinessInfo }) {
  const [result, setResult] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setResult('')
    setCopied(false)

    try {
      const res = await fetch('/api/generate-keyword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessInfo, customTopic }),
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
      <div className="bg-[var(--color-primary-light)] rounded-2xl p-5">
        <p className="text-sm text-[var(--color-dark)]">
          <strong>{businessInfo.name}</strong>의 업종과 지역을 기반으로<br />
          블로그에 쓰면 좋은 키워드를 추천해드려요.
        </p>
      </div>

      {/* 추가 주제 */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-dark)] mb-1.5">
          특정 주제가 있다면 <span className="font-normal text-gray-400">(선택)</span>
        </label>
        <input
          type="text"
          placeholder="예: 욕실 리모델링, 수제버거, 두피 관리"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm"
        />
      </div>

      {/* 생성 버튼 */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
          loading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:scale-[0.98]'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="ml-2">키워드 분석 중...</span>
          </span>
        ) : (
          '키워드 추천받기'
        )}
      </button>

      {/* 결과 */}
      {result && (
        <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-gray-bg)] border-b border-[var(--color-border)]">
            <span className="text-sm font-semibold text-[var(--color-dark)]">추천 키워드</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
            >
              {copied ? '✓ 복사됨' : '복사하기'}
            </button>
          </div>
          <div className="p-5 result-content whitespace-pre-wrap text-sm leading-relaxed">
            {result}
          </div>
        </div>
      )}
    </div>
  )
}
