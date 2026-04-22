'use client'

import { useState, useRef } from 'react'
import type { BusinessInfo } from '@/app/page'

const BLOG_STYLES = [
  { value: 'review', label: '시공/서비스 후기', desc: '작업 과정과 결과를 보여주는 글' },
  { value: 'info', label: '정보/팁 공유', desc: '고객이 궁금해할 정보를 알려주는 글' },
  { value: 'before-after', label: '비포&애프터', desc: '전후 비교로 실력을 보여주는 글' },
  { value: 'daily', label: '일상/현장 이야기', desc: '현장에서 있었던 소소한 이야기' },
  { value: 'qna', label: 'Q&A 형식', desc: '자주 묻는 질문에 답하는 글' },
]

export default function BlogGenerator({ businessInfo }: { businessInfo: BusinessInfo }) {
  const [photos, setPhotos] = useState<string[]>([])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [style, setStyle] = useState('review')
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files).slice(0, 10 - photos.length)
    const newPreviews: string[] = []
    const newPhotoFiles: File[] = []

    newFiles.forEach((file) => {
      newPhotoFiles.push(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        newPreviews.push(ev.target?.result as string)
        if (newPreviews.length === newFiles.length) {
          setPhotos((prev) => [...prev, ...newPreviews])
          setPhotoFiles((prev) => [...prev, ...newPhotoFiles])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    setLoading(true)
    setResult('')
    setCopied(false)

    try {
      const res = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessInfo,
          style,
          topic,
          keywords,
          photoCount: photos.length,
          photos: photos.slice(0, 5), // 최대 5장 base64 전송
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '생성에 실패했습니다')
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
      {/* 사진 업로드 */}
      <div className="bg-[var(--color-gray-bg)] rounded-2xl p-5">
        <label className="block text-sm font-semibold text-[var(--color-dark)] mb-3">
          사진 올리기 <span className="font-normal text-gray-400">(최대 10장)</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {photos.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-10 border-2 border-dashed border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] transition-colors bg-white"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm text-gray-500">클릭해서 사진을 올려주세요</p>
              <p className="text-xs text-gray-400 mt-1">시공 사진, 음식 사진, 매장 사진 등</p>
            </div>
          </button>
        ) : (
          <div>
            <div className="photo-grid mb-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative group">
                  <img src={photo} alt={`사진 ${i + 1}`} />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {photos.length < 10 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[100px] border-2 border-dashed border-[var(--color-border)] rounded-lg flex items-center justify-center text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  +
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">{photos.length}장 선택됨</p>
          </div>
        )}
      </div>

      {/* 글 스타일 */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-dark)] mb-3">어떤 느낌의 글을 쓸까요?</label>
        <div className="grid grid-cols-1 gap-2">
          {BLOG_STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStyle(s.value)}
              className={`text-left px-4 py-3 rounded-xl border transition-all ${
                style === s.value
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                  : 'border-[var(--color-border)] hover:border-gray-300'
              }`}
            >
              <span className="text-sm font-medium">{s.label}</span>
              <span className="text-xs text-gray-400 ml-2">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 주제 */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-dark)] mb-1.5">
          오늘 쓸 글의 주제 <span className="font-normal text-gray-400">(선택)</span>
        </label>
        <input
          type="text"
          placeholder="예: 강남 아파트 욕실 리모델링, 수제버거 신메뉴 출시"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm"
        />
      </div>

      {/* 키워드 */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-dark)] mb-1.5">
          넣고 싶은 키워드 <span className="font-normal text-gray-400">(선택)</span>
        </label>
        <input
          type="text"
          placeholder="예: 강남인테리어, 욕실리모델링, 합리적인가격"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">네이버 검색에 잡히고 싶은 키워드를 적어주세요</p>
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
            <span className="ml-2">글 쓰는 중...</span>
          </span>
        ) : (
          '블로그 글 생성하기'
        )}
      </button>

      {/* 결과 */}
      {result && (
        <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-gray-bg)] border-b border-[var(--color-border)]">
            <span className="text-sm font-semibold text-[var(--color-dark)]">생성된 블로그 글</span>
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
