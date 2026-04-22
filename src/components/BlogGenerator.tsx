'use client'

import { useState, useRef, useCallback } from 'react'
import type { BusinessInfo } from '@/app/page'

const BLOG_STYLES = [
  { value: 'review', label: '시공/서비스 후기', desc: '작업 과정과 결과를 보여주는 글' },
  { value: 'info', label: '정보/팁 공유', desc: '고객이 궁금해할 정보를 알려주는 글' },
  { value: 'before-after', label: '비포&애프터', desc: '전후 비교로 실력을 보여주는 글' },
  { value: 'daily', label: '일상/현장 이야기', desc: '현장에서 있었던 소소한 이야기' },
  { value: 'qna', label: 'Q&A 형식', desc: '자주 묻는 질문에 답하는 글' },
]

const PHOTO_ROLES = [
  { value: 'before', label: '시공 전', color: '#3B82F6' },
  { value: 'after', label: '시공 후', color: '#10B981' },
  { value: 'process', label: '작업 과정', color: '#F59E0B' },
  { value: 'result', label: '완성 결과', color: '#10B981' },
  { value: 'detail', label: '디테일 컷', color: '#8B5CF6' },
  { value: 'space', label: '매장/공간', color: '#EC4899' },
  { value: 'product', label: '상품/메뉴', color: '#F97316' },
  { value: 'etc', label: '기타', color: '#6B7280' },
]

type PhotoItem = {
  src: string
  role: string
  caption: string
}

// 이미지를 리사이즈하여 base64로 변환 (API 전송용)
function resizeImage(dataUrl: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.width
      let h = img.height
      if (w > maxWidth) {
        h = (h * maxWidth) / w
        w = maxWidth
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = dataUrl
  })
}

export default function BlogGenerator({ businessInfo }: { businessInfo: BusinessInfo }) {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [style, setStyle] = useState('review')
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 사진 업로드 (리사이즈 포함)
  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files).slice(0, 10 - photos.length)
    const newPhotos: PhotoItem[] = []

    for (const file of newFiles) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target?.result as string)
        reader.readAsDataURL(file)
      })

      const resized = await resizeImage(dataUrl)
      newPhotos.push({ src: resized, role: 'etc', caption: '' })
    }

    setPhotos((prev) => [...prev, ...newPhotos])
    // input 초기화 (같은 파일 재선택 가능)
    e.target.value = ''
  }, [photos.length])

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const updatePhotoRole = (index: number, role: string) => {
    setPhotos((prev) => prev.map((p, i) => i === index ? { ...p, role } : p))
  }

  const updatePhotoCaption = (index: number, caption: string) => {
    setPhotos((prev) => prev.map((p, i) => i === index ? { ...p, caption } : p))
  }

  // 드래그앤드롭 순서 변경
  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    setPhotos((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(dragIndex, 1)
      updated.splice(index, 0, moved)
      return updated
    })
    setDragIndex(index)
  }
  const handleDragEnd = () => setDragIndex(null)

  // 글 생성
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
          photos: photos.map((p) => ({
            src: p.src,
            role: p.role,
            caption: p.caption,
          })),
        }),
      })

      // 에러 응답 처리 (HTML/JSON 모두 대응)
      if (!res.ok) {
        let errorMsg = '생성에 실패했습니다'
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const err = await res.json()
          errorMsg = err.error || errorMsg
        } else {
          const text = await res.text()
          if (text.includes('ANTHROPIC_API_KEY')) {
            errorMsg = 'API 키가 설정되지 않았습니다. Vercel 환경변수를 확인해주세요.'
          } else {
            errorMsg = `서버 오류 (${res.status}): 잠시 후 다시 시도해주세요.`
          }
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

  const getRoleInfo = (role: string) => PHOTO_ROLES.find((r) => r.value === role) || PHOTO_ROLES[7]

  return (
    <div className="space-y-5">
      {/* 사진 업로드 */}
      <div className="bg-[var(--color-gray-bg)] rounded-2xl p-5">
        <label className="block text-sm font-semibold text-[var(--color-dark)] mb-1">
          사진 올리기 <span className="font-normal text-gray-400">(최대 10장)</span>
        </label>
        <p className="text-xs text-gray-400 mb-3">
          사진을 드래그해서 순서를 바꿀 수 있어요. 각 사진에 역할과 설명을 달아주면 더 정확한 글이 나와요.
        </p>

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
          <div className="space-y-3">
            {photos.map((photo, i) => {
              const roleInfo = getRoleInfo(photo.role)
              return (
                <div
                  key={i}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                  className={`flex gap-3 p-3 bg-white rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                    dragIndex === i ? 'border-[var(--color-primary)] shadow-md scale-[1.01]' : 'border-[var(--color-border)]'
                  }`}
                >
                  {/* 순서 표시 + 사진 */}
                  <div className="relative shrink-0">
                    <img
                      src={photo.src}
                      alt={`사진 ${i + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[var(--color-dark)] text-white text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      &times;
                    </button>
                  </div>

                  {/* 역할 + 설명 */}
                  <div className="flex-1 min-w-0">
                    {/* 역할 태그 */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {PHOTO_ROLES.map((role) => (
                        <button
                          key={role.value}
                          onClick={() => updatePhotoRole(i, role.value)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all"
                          style={
                            photo.role === role.value
                              ? { backgroundColor: role.color, color: 'white', borderColor: role.color }
                              : { borderColor: '#E5E7EB', color: '#9CA3AF' }
                          }
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>

                    {/* 사진 설명 */}
                    <input
                      type="text"
                      placeholder={`이 사진에 대해 간단히 설명해주세요 (예: ${
                        photo.role === 'before' ? '시공 전 낡은 욕실 상태' :
                        photo.role === 'after' ? '시공 완료된 욕실' :
                        photo.role === 'process' ? '타일 시공 중인 모습' :
                        '사진 설명'
                      })`}
                      value={photo.caption}
                      onChange={(e) => updatePhotoCaption(i, e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-gray-bg)]"
                    />
                  </div>
                </div>
              )
            })}

            {/* 사진 추가 버튼 */}
            {photos.length < 10 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-[var(--color-border)] rounded-xl text-sm text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                + 사진 추가하기 ({photos.length}/10)
              </button>
            )}
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
