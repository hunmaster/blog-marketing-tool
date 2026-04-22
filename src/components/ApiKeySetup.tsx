'use client'

import { useState } from 'react'

type Props = {
  onComplete: (key: string) => void
  isModal?: boolean
  defaultValue?: string
}

export default function ApiKeySetup({ onComplete, isModal, defaultValue }: Props) {
  const [key, setKey] = useState(defaultValue || '')
  const [showKey, setShowKey] = useState(false)

  const isValid = key.trim().length > 10

  return (
    <div className={isModal ? 'p-6' : 'max-w-lg mx-auto px-4 pt-12'}>
      {!isModal && (
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-dark)] mb-2">시작하기</h1>
          <p className="text-gray-500 text-sm">구글 계정만 있으면 바로 시작할 수 있어요</p>
        </div>
      )}

      {/* 설명 */}
      {!isModal && (
        <div className="bg-[var(--color-primary-light)] rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-dark)] mb-2">글써주는집은 어떻게 작동하나요?</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            사진과 업체 정보를 넣으면 <strong>AI가 사람처럼 자연스러운 블로그 글</strong>을 만들어줘요.
            Google의 AI 기술을 활용하며, <strong>완전 무료</strong>로 사용할 수 있습니다.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed mt-2">
            <strong>API 키</strong>는 AI를 사용하기 위한 비밀번호 같은 거예요.
            구글 계정으로 로그인하면 바로 발급받을 수 있어요.
          </p>
        </div>
      )}

      {/* 발급 가이드 */}
      {!isModal && (
        <div className="bg-[var(--color-gray-bg)] rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-[var(--color-dark)] mb-3">API 키 발급받기 (30초 완료)</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
              <div>
                <p className="text-sm text-[var(--color-dark)]">아래 버튼을 눌러 Google AI Studio에 접속해주세요</p>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-1.5 px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15,3 21,3 21,9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Google AI API 키 발급 (무료)
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
              <div>
                <p className="text-sm text-[var(--color-dark)]">구글 계정으로 로그인해주세요</p>
                <p className="text-xs text-gray-400 mt-0.5">이미 구글 계정이 있으면 바로 로그인돼요</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
              <div>
                <p className="text-sm text-[var(--color-dark)]">"Create API Key" 버튼을 클릭해주세요</p>
                <p className="text-xs text-gray-400 mt-0.5">프로젝트 선택 팝업이 나오면 아무거나 선택하면 돼요</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</div>
              <div>
                <p className="text-sm text-[var(--color-dark)]">생성된 키를 복사해서 아래에 붙여넣기 해주세요</p>
                <p className="text-xs text-gray-400 mt-0.5">AIza... 로 시작하는 코드예요</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-xl border border-[var(--color-border)]">
            <div className="flex items-start gap-2">
              <span className="text-green-500 text-sm font-bold">무료</span>
              <div>
                <p className="text-xs text-gray-600">블로그 글, 릴스 캡션, 키워드 추천 모두 <strong>무료</strong>예요.</p>
                <p className="text-xs text-gray-400 mt-0.5">카드 등록도 필요 없어요. 하루 1,500회까지 사용 가능합니다.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API 키 입력 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">API 키 입력</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="AIza..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-4 py-3 pr-20 rounded-xl border border-[var(--color-border)] text-sm bg-white transition-all font-mono"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showKey ? '숨기기' : '보기'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            키는 이 브라우저에만 저장되며 외부로 전송되지 않아요
          </p>
        </div>

        {isValid && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
            <span className="text-green-600 text-xs">키가 입력되었습니다</span>
          </div>
        )}

        <button
          onClick={() => isValid && onComplete(key.trim())}
          disabled={!isValid}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
            isValid
              ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isModal ? '저장하기' : '다음 단계로'}
        </button>
      </div>
    </div>
  )
}
