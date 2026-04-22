'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import BusinessSetup from '@/components/BusinessSetup'
import ApiKeySetup from '@/components/ApiKeySetup'
import BlogGenerator from '@/components/BlogGenerator'
import CaptionGenerator from '@/components/CaptionGenerator'
import KeywordHelper from '@/components/KeywordHelper'

export type BusinessInfo = {
  name: string
  category: string
  region: string
  strengths: string
  tone: string
}

export type TabType = 'blog' | 'caption' | 'keyword'

export default function Home() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [apiKey, setApiKey] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabType>('blog')
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // localStorage에서 복원
  useEffect(() => {
    const savedBiz = localStorage.getItem('businessInfo')
    const savedKey = localStorage.getItem('apiKey')
    if (savedBiz) {
      try { setBusinessInfo(JSON.parse(savedBiz)) } catch { /* ignore */ }
    }
    if (savedKey) setApiKey(savedKey)
    setLoaded(true)
  }, [])

  const handleSetBusiness = (info: BusinessInfo) => {
    setBusinessInfo(info)
    localStorage.setItem('businessInfo', JSON.stringify(info))
  }

  const handleSetApiKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem('apiKey', key)
    setIsApiKeyOpen(false)
  }

  const handleReset = () => {
    setBusinessInfo(null)
    localStorage.removeItem('businessInfo')
  }

  if (!loaded) return <div className="min-h-screen bg-white" />

  // 1단계: API 키 없으면 입력
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <ApiKeySetup onComplete={handleSetApiKey} />
      </div>
    )
  }

  // 2단계: 업체 정보 없으면 입력
  if (!businessInfo) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <BusinessSetup onComplete={handleSetBusiness} isModal={false} />
      </div>
    )
  }

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'blog', label: '블로그 글쓰기', icon: '📝' },
    { key: 'caption', label: '릴스 캡션', icon: '🎬' },
    { key: 'keyword', label: '키워드 추천', icon: '🔍' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header
        onSetup={() => setIsSetupOpen(true)}
        onApiKey={() => setIsApiKeyOpen(true)}
        onReset={handleReset}
      />

      {/* 업체 정보 수정 모달 */}
      {isSetupOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setIsSetupOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-semibold">업체 정보 수정</h3>
              <button onClick={() => setIsSetupOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <BusinessSetup
              onComplete={(info) => { handleSetBusiness(info); setIsSetupOpen(false) }}
              isModal={true}
              defaultValues={businessInfo}
            />
          </div>
        </div>
      )}

      {/* API 키 수정 모달 */}
      {isApiKeyOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setIsApiKeyOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-semibold">API 키 변경</h3>
              <button onClick={() => setIsApiKeyOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <ApiKeySetup onComplete={handleSetApiKey} isModal={true} defaultValue={apiKey} />
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 pt-6 pb-20">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[var(--color-dark)]">
            {businessInfo.name}님, 오늘은 어떤 콘텐츠를 만들어볼까요?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {businessInfo.category} · {businessInfo.region}
          </p>
        </div>

        <div className="flex border-b border-[var(--color-border)] mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-[var(--color-primary)] tab-active'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'blog' && <BlogGenerator businessInfo={businessInfo} apiKey={apiKey} />}
        {activeTab === 'caption' && <CaptionGenerator businessInfo={businessInfo} apiKey={apiKey} />}
        {activeTab === 'keyword' && <KeywordHelper businessInfo={businessInfo} apiKey={apiKey} />}
      </main>
    </div>
  )
}
