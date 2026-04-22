'use client'

import { useState } from 'react'
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

  // 최초 진입 시 업체 정보 입력
  if (!businessInfo) {
    return (
      <div className="min-h-screen bg-white">
        <Header onSetup={() => {}} />
        <BusinessSetup onComplete={(info) => setBusinessInfo(info)} isModal={false} />
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
      <Header onSetup={() => setIsSetupOpen(true)} />

      {/* 업체 정보 수정 모달 */}
      {isSetupOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-semibold">업체 정보 수정</h3>
              <button onClick={() => setIsSetupOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <BusinessSetup
              onComplete={(info) => { setBusinessInfo(info); setIsSetupOpen(false) }}
              isModal={true}
              defaultValues={businessInfo}
            />
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 pt-6 pb-20">
        {/* 인사 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[var(--color-dark)]">
            {businessInfo.name}님, 오늘은 어떤 콘텐츠를 만들어볼까요?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {businessInfo.category} · {businessInfo.region}
          </p>
        </div>

        {/* 탭 */}
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

        {/* 탭 콘텐츠 */}
        {activeTab === 'blog' && <BlogGenerator businessInfo={businessInfo} />}
        {activeTab === 'caption' && <CaptionGenerator businessInfo={businessInfo} />}
        {activeTab === 'keyword' && <KeywordHelper businessInfo={businessInfo} />}
      </main>
    </div>
  )
}
