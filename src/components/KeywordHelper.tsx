'use client'

import { useState } from 'react'
import type { BusinessInfo } from '@/app/page'

type KeywordData = {
  keyword: string
  volume: string
  blogCount: number
  totalResults: string
  competition: string
  score: number
}

type ResearchResult = {
  keywords: KeywordData[]
  baseKeyword: string
  totalFound: number
}

export default function KeywordHelper({ businessInfo, apiKey }: { businessInfo: BusinessInfo; apiKey: string }) {
  const [customTopic, setCustomTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingAi, setLoadingAi] = useState(false)
  const [research, setResearch] = useState<ResearchResult | null>(null)
  const [aiResult, setAiResult] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState<'research' | 'ai'>('research')

  // 네이버 실시간 키워드 리서치 (무료)
  const handleResearch = async () => {
    const keyword = customTopic.trim() || businessInfo.category.split('/')[0]
    setLoading(true)
    setResearch(null)

    try {
      const res = await fetch('/api/keyword-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseKeyword: keyword,
          region: businessInfo.region.split(' ')[0], // 첫 번째 지역명만
          category: businessInfo.category,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '분석에 실패했습니다')
      }

      const data = await res.json()
      setResearch(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  // AI 키워드 추천 (Claude API)
  const handleAiRecommend = async () => {
    setLoadingAi(true)
    setAiResult('')

    try {
      const res = await fetch('/api/generate-keyword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessInfo, customTopic, apiKey }),
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
          setAiResult((prev) => prev + decoder.decode(value, { stream: true }))
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다'
      setAiResult('오류: ' + message)
    } finally {
      setLoadingAi(false)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getVolumeColor = (vol: string) => {
    if (vol === '검색량 높음') return 'text-green-600 bg-green-50'
    if (vol === '검색량 보통') return 'text-yellow-600 bg-yellow-50'
    if (vol === '검색량 낮음') return 'text-gray-500 bg-gray-100'
    return 'text-gray-400 bg-gray-50'
  }

  const getCompColor = (comp: string) => {
    if (comp === '매우 낮음') return 'text-green-600 bg-green-50'
    if (comp === '낮음') return 'text-blue-600 bg-blue-50'
    if (comp === '보통') return 'text-yellow-600 bg-yellow-50'
    if (comp === '높음') return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-5">
      {/* 모드 선택 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveMode('research')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            activeMode === 'research'
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'bg-white text-gray-600 border-[var(--color-border)] hover:border-gray-300'
          }`}
        >
          네이버 실시간 분석 (무료)
        </button>
        <button
          onClick={() => setActiveMode('ai')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            activeMode === 'ai'
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'bg-white text-gray-600 border-[var(--color-border)] hover:border-gray-300'
          }`}
        >
          AI 키워드 추천
        </button>
      </div>

      {/* 키워드 입력 */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-dark)] mb-1.5">
          분석할 키워드
        </label>
        <input
          type="text"
          placeholder={`예: ${businessInfo.category.split('/')[0]}, 욕실리모델링, 수제버거`}
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">
          비워두면 업종({businessInfo.category}) 기반으로 자동 분석해요
        </p>
      </div>

      {/* 네이버 실시간 분석 모드 */}
      {activeMode === 'research' && (
        <>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-700">
              네이버 자동완성 + 검색결과를 실시간 분석해서 키워드를 추천합니다.
              API 키 비용이 들지 않아요.
            </p>
          </div>

          <button
            onClick={handleResearch}
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
                <span className="ml-2">네이버 분석 중... (10~20초)</span>
              </span>
            ) : (
              '네이버 키워드 분석하기'
            )}
          </button>

          {/* 리서치 결과 */}
          {research && (
            <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 bg-[var(--color-gray-bg)] border-b border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--color-dark)]">
                    "{research.baseKeyword}" 연관 키워드 {research.totalFound}개
                  </span>
                  <button
                    onClick={() => handleCopy(
                      research.keywords.map((k) => k.keyword).join('\n'),
                      'all-keywords'
                    )}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
                  >
                    {copied === 'all-keywords' ? '✓ 복사됨' : '전체 복사'}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-[var(--color-border)]">
                {/* 헤더 */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-[var(--color-gray-bg)] text-[10px] font-semibold text-gray-500 uppercase">
                  <div className="col-span-5">키워드</div>
                  <div className="col-span-2 text-center">검색량</div>
                  <div className="col-span-2 text-center">경쟁도</div>
                  <div className="col-span-2 text-center">블로그 수</div>
                  <div className="col-span-1"></div>
                </div>

                {research.keywords.map((kw, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-[var(--color-gray-bg)] transition-colors">
                    <div className="col-span-5">
                      <span className="text-sm text-[var(--color-dark)] font-medium">{kw.keyword}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getVolumeColor(kw.volume)}`}>
                        {kw.volume === '측정불가' ? '-' : kw.volume.replace('검색량 ', '')}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getCompColor(kw.competition)}`}>
                        {kw.competition}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-xs text-gray-500">
                        {kw.blogCount > 0 ? kw.blogCount.toLocaleString() : '-'}
                      </span>
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => handleCopy(kw.keyword, `kw-${i}`)}
                        className="text-gray-300 hover:text-[var(--color-primary)] transition-colors"
                        title="키워드 복사"
                      >
                        {copied === `kw-${i}` ? (
                          <span className="text-green-500 text-xs">✓</span>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 bg-[var(--color-gray-bg)] border-t border-[var(--color-border)]">
                <p className="text-[10px] text-gray-400">
                  * 네이버 자동완성 + 검색결과 기반 추정치입니다. 정확한 검색량은 네이버 검색광고 키워드 도구를 참고하세요.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* AI 추천 모드 */}
      {activeMode === 'ai' && (
        <>
          <div className="bg-[var(--color-primary-light)] rounded-xl p-4">
            <p className="text-xs text-[var(--color-dark)]">
              AI가 업종/지역을 분석해서 블로그 키워드와 제목을 추천합니다.
              Claude API 비용이 발생해요.
            </p>
          </div>

          <button
            onClick={handleAiRecommend}
            disabled={loadingAi}
            className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
              loadingAi
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:scale-[0.98]'
            }`}
          >
            {loadingAi ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="ml-2">AI 분석 중...</span>
              </span>
            ) : (
              'AI 키워드 추천받기'
            )}
          </button>

          {aiResult && (
            <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-gray-bg)] border-b border-[var(--color-border)]">
                <span className="text-sm font-semibold text-[var(--color-dark)]">AI 추천 키워드</span>
                <button
                  onClick={() => handleCopy(aiResult, 'ai-result')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
                >
                  {copied === 'ai-result' ? '✓ 복사됨' : '복사하기'}
                </button>
              </div>
              <div className="p-5 result-content whitespace-pre-wrap text-sm leading-relaxed">
                {aiResult}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
