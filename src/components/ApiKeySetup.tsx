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

  const isValid = key.trim().startsWith('sk-ant-')

  return (
    <div className={isModal ? 'p-6' : 'max-w-lg mx-auto px-4 pt-12'}>
      {!isModal && (
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-dark)] mb-2">API 키 설정</h1>
          <p className="text-gray-500 text-sm">글을 생성하려면 Claude API 키가 필요해요</p>
        </div>
      )}

      {/* 안내 가이드 */}
      {!isModal && (
        <div className="bg-[var(--color-gray-bg)] rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-[var(--color-dark)] mb-3">API 키 발급받는 방법</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
              <div>
                <p className="text-sm text-[var(--color-dark)]">아래 버튼을 눌러 Anthropic 사이트에 접속해주세요</p>
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-1.5 px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15,3 21,3 21,9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Anthropic API 키 발급 페이지 바로가기
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
              <div>
                <p className="text-sm text-[var(--color-dark)]">회원가입 후 로그인해주세요</p>
                <p className="text-xs text-gray-400 mt-0.5">구글 계정으로 간편 가입 가능</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
              <div>
                <p className="text-sm text-[var(--color-dark)]">"Create Key" 버튼을 클릭해서 키를 생성해주세요</p>
                <p className="text-xs text-gray-400 mt-0.5">이름은 아무거나 적어도 돼요 (예: 블로그용)</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</div>
              <div>
                <p className="text-sm text-[var(--color-dark)]">생성된 키를 복사해서 아래에 붙여넣기 해주세요</p>
                <p className="text-xs text-gray-400 mt-0.5">sk-ant- 으로 시작하는 긴 코드예요</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-xl border border-[var(--color-border)]">
            <div className="flex items-start gap-2">
              <span className="text-sm">💡</span>
              <div>
                <p className="text-xs text-gray-600"><strong>비용 안내:</strong> 블로그 글 1편 생성에 약 50~100원 정도 비용이 발생해요.</p>
                <p className="text-xs text-gray-400 mt-0.5">신규 가입 시 $5 무료 크레딧이 제공됩니다 (약 50편 이상 생성 가능)</p>
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
              placeholder="sk-ant-api03-..."
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

        {/* 입력값 검증 피드백 */}
        {key && !isValid && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
            <span className="text-red-500 text-xs">sk-ant- 으로 시작하는 올바른 키를 입력해주세요</span>
          </div>
        )}
        {isValid && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
            <span className="text-green-600 text-xs">올바른 형식의 키입니다</span>
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
