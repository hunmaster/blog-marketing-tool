import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) {
    return Response.json({ error: '서버 설정 오류입니다. 관리자에게 문의해주세요.' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { businessInfo, style, topic, keywords, photos } = body

    const toneMap: Record<string, string> = {
      friendly: '친근하고 따뜻한 이웃 같은 말투. 해요체 위주. "~했어요", "~더라고요" 같은 구어체 자연스럽게 사용.',
      professional: '신뢰감 있는 전문가 말투. 합쇼체와 해요체를 섞어서 사용. 경험과 전문성이 느껴지게.',
      casual: '편안하고 가벼운 일상 말투. 해요체 위주. "~인데요", "~거든요" 같은 표현 자연스럽게.',
    }

    const styleMap: Record<string, string> = {
      review: '시공/서비스 완료 후기 형식. 어떤 의뢰가 들어왔고, 어떻게 진행했고, 결과가 어떻게 나왔는지 자연스럽게 풀어내기.',
      info: '정보/팁 공유 형식. 고객들이 자주 궁금해하는 내용을 친절하게 알려주는 글.',
      'before-after': '비포&애프터 형식. 시작 상태와 완성 상태를 대비시켜서 변화를 극적으로 보여주기.',
      daily: '일상/현장 이야기 형식. 오늘 있었던 일을 일기처럼 편하게 쓰기.',
      qna: 'Q&A 형식. 고객들이 자주 묻는 질문 3-5개를 뽑아서 하나씩 답변하기.',
    }

    const roleLabels: Record<string, string> = {
      before: '시공 전', after: '시공 후', process: '작업 과정', result: '완성 결과',
      detail: '디테일 컷', space: '매장/공간', product: '상품/메뉴', etc: '기타',
    }

    // 매번 다른 글을 위한 랜덤 요소
    const openingStyles = [
      '날씨/계절 이야기로 시작',
      '고객 에피소드로 시작 ("지난주에 연락 주신 분이...")',
      '질문으로 시작 ("혹시 ~해보신 적 있으세요?")',
      '현장 도착 장면으로 시작 ("아침부터 현장에 도착했는데...")',
      '최근 트렌드 언급으로 시작',
      '고민/걱정 공감으로 시작 ("~할 때 고민 많으시죠")',
      '결과부터 보여주고 시작 ("먼저 완성된 모습부터 보여드릴게요")',
      '숫자/데이터로 시작 ("올해만 벌써 ~건째...")',
      '비하인드 스토리로 시작',
      '감탄사로 시작 ("와, 이번 건은 진짜...")',
    ]
    const closingStyles = [
      '다음 작업 예고로 마무리', '고객 만족 한마디로 마무리', '짧은 소감 한 줄로 마무리',
      '계절/날씨와 연결해서 마무리', '문의 안내 없이 자연스럽게 끝내기',
    ]
    const structureStyles = [
      '소제목 없이 자연스러운 이야기체로 쭉 이어가기',
      '소제목 2개만 사용해서 구분하기',
      '짧은 문단 위주로 끊어서 쓰기 (문단당 2-3문장)',
      '대화체를 섞어서 쓰기 ("사장님이 그러시더라고요...")',
      '시간순으로 풀어가기 (아침→점심→완성)',
    ]
    const randomOpening = openingStyles[Math.floor(Math.random() * openingStyles.length)]
    const randomClosing = closingStyles[Math.floor(Math.random() * closingStyles.length)]
    const randomStructure = structureStyles[Math.floor(Math.random() * structureStyles.length)]

    // 사진 정보 구성
    const photoDescriptions: string[] = []
    const geminiParts: { inlineData: { mimeType: string; data: string } }[] = []

    if (photos && photos.length > 0) {
      const photosToSend = photos.slice(0, 5)
      for (let i = 0; i < photosToSend.length; i++) {
        const photo = photosToSend[i]
        const base64Match = photo.src?.match(/^data:image\/(.*?);base64,(.*)$/)
        if (base64Match) {
          geminiParts.push({
            inlineData: { mimeType: `image/${base64Match[1]}`, data: base64Match[2] },
          })
        }
        const roleLabel = roleLabels[photo.role] || '기타'
        const captionText = photo.caption ? ` - ${photo.caption}` : ''
        photoDescriptions.push(`사진 ${i + 1}: [${roleLabel}]${captionText}`)
      }
      for (let i = 5; i < photos.length; i++) {
        const photo = photos[i]
        const roleLabel = roleLabels[photo.role] || '기타'
        const captionText = photo.caption ? ` - ${photo.caption}` : ''
        photoDescriptions.push(`사진 ${i + 1}: [${roleLabel}]${captionText} (이미지 미첨부)`)
      }
    }

    const photoSection = photoDescriptions.length > 0
      ? `\n\n사진 구성 (순서대로):\n${photoDescriptions.join('\n')}`
      : '\n\n(사진 없음 - 텍스트 기반으로 작성)'

    const systemPrompt = `당신은 실제 소상공인 사장님이 직접 블로그를 쓰는 것처럼 글을 대필하는 작성자입니다.

[이번 글의 스타일 지정 - 반드시 따르세요]
- 도입부: ${randomOpening}
- 마무리: ${randomClosing}
- 글 구조: ${randomStructure}

[말투 규칙]
${toneMap[businessInfo.tone] || toneMap.friendly}

[AI 냄새 제거 - 가장 중요!!!]
절대 사용 금지 단어/표현:
- "다양한", "특별한", "완벽한", "훌륭한", "놀라운", "획기적인", "최상의", "최고의"
- "또한", "더불어", "뿐만 아니라", "나아가", "한편", "이처럼", "그러므로"
- "~하는 것이 중요합니다", "~할 수 있습니다", "~를 추천드립니다"
- "소개해드리겠습니다", "알려드리겠습니다", "살펴보겠습니다"
- "이상으로 ~에 대해 알아보았습니다", "~에 대해 알아보겠습니다"
- "많은 관심 부탁드립니다", "감사합니다" (마무리 인사)
- "고객님", "여러분" (독자 호칭 반복)

대신 이렇게 쓰세요:
- "그래서" → "근데", "아무튼", 또는 접속사 없이 바로 이어가기
- "~입니다" 반복 → "~거든요", "~더라고요", "~했어요" 섞기
- 감탄/혼잣말 자연스럽게: "진짜", "확실히", "솔직히", "아 맞다"

[글쓰기 규칙]
1. 문장 길이를 불규칙하게. 짧은 거 3개 → 긴 거 1개 → 짧은 거 2개 이런 식으로.
2. 한 문단에 같은 문장 종결 패턴 연속 2번 이상 금지. (~요, ~요, ~요 이런 식 금지)
3. 글 분량 1500~2500자.
4. 키워드는 자연스럽게 3-5회 반복. 억지 삽입 금지.
5. 사진 위치는 [사진 1], [사진 2] 형태로 표시.
6. 마크다운 문법 절대 금지. 순수 텍스트만.
7. 이모지 최대 2-3개만. 없어도 됨.
8. 연락처 유도는 글 맨 끝에 한 번만, 자연스럽게.`

    const userPrompt = `블로그 글을 작성해주세요.

업체 정보:
- 업체명: ${businessInfo.name}
- 업종: ${businessInfo.category}
- 지역: ${businessInfo.region}
- 강점: ${businessInfo.strengths}

글 요청:
- 글 스타일: ${styleMap[style] || style}
- 주제: ${topic || '사진 내용을 바탕으로 자유롭게'}
- 넣어야 할 키워드: ${keywords || '없음'}
- 총 사진 수: ${photos?.length || 0}장
${photoSection}

중요: 사진의 역할과 설명을 참고해서 글의 흐름을 구성하세요.
글 중간에 [사진 1], [사진 2] 등으로 사진 삽입 위치를 표시해주세요.`

    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const parts: (string | { inlineData: { mimeType: string; data: string } })[] = []
    // 사진 추가
    for (const part of geminiParts) {
      parts.push(part)
    }
    // 프롬프트 추가
    parts.push(systemPrompt + '\n\n---\n\n' + userPrompt)

    const result = await model.generateContentStream(parts)

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(encoder.encode(text))
          }
          controller.close()
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Stream error'
          controller.enqueue(encoder.encode(`\n\n[오류: ${msg}]`))
          controller.close()
        }
      },
    })

    return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  } catch (error: unknown) {
    console.error('Blog generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
