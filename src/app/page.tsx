'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import BusinessSetup from '@/components/BusinessSetup'
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
  const [activeTab, setActiveTab] = useState<TabType>('blog')
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('businessInfo')
    if (saved) {
      try { setBusinessInfo(JSON.parse(saved)) } catch { /* ignore */ }
    }
    setLoaded(true)
  }, [])

  const handleSetBusiness = (info: BusinessInfo) => {
    setBusinessInfo(info)
    localStorage.setItem('businessInfo', JSON.stringify(info))
  }

  const handleReset = () => {
    setBusinessInfo(null)
    localStorage.removeItem('businessInfo')
  }

  if (!loaded) return <div className="min-h-screen bg-white" />

  // 업체 정보 없으면 입력 화면
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
      <Header onSetup={() => setIsSetupOpen(true)} onReset={handleReset} />

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

        {activeTab === 'blog' && <BlogGenerator businessInfo={businessInfo} />}
        {activeTab === 'caption' && <CaptionGenerator businessInfo={businessInfo} />}
        {activeTab === 'keyword' && <KeywordHelper businessInfo={businessInfo} />}
      </main>
    </div>
  )
}
