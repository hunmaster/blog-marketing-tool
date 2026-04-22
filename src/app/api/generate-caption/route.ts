import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessInfo, captionType, subject } = body

    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      return Response.json({ error: '서버 설정 오류입니다. 관리자에게 문의해주세요.' }, { status: 500 })
    }

    const typeMap: Record<string, string> = {
      hook: '후킹형: 첫 줄에서 시선을 확 잡는 스타일. 질문이나 놀라운 사실로 시작.',
      story: '스토리형: 작업 과정이나 에피소드를 짧게 풀어내는 스타일.',
      tip: '정보/팁형: 유용한 정보를 간결하게 전달하는 스타일.',
      'before-after': '비포애프터형: 변화의 임팩트를 강조하는 스타일.',
    }

    const captionTones = [
      '자신감 넘치는 사장님 톤',
      '소소한 일상 공유하는 톤',
      '전문가인데 편하게 말하는 톤',
      '약간 유머 섞인 톤',
      '진지하게 작업 과정 설명하는 톤',
    ]
    const randomTone = captionTones[Math.floor(Math.random() * captionTones.length)]

    const prompt = `당신은 실제 사장님이 인스타에 직접 쓰는 것처럼 릴스 캡션을 대필합니다.

[이번 캡션 톤: ${randomTone}]

캡션 구성:
1. 후킹 첫 줄 (스크롤 멈추는 한 줄)
2. 본문 2-4줄 (핵심만)
3. CTA 1줄 (문의/팔로우 유도)
4. 해시태그 15-20개 (지역 3-4개 + 업종 5-6개 + 트렌드 5-6개 + 브랜드 1-2개)

[AI 냄새 제거 - 필수]
금지 단어: "다양한", "특별한", "완벽한", "훌륭한", "놀라운", "최고의", "추천드립니다"
금지 패턴: 너무 깔끔한 문장, 교과서 같은 표현
실제 인스타처럼: 줄임말, 구어체, 이모지 적절히 사용
3가지 버전 모두 톤과 구조가 확실히 달라야 합니다.

마크다운 문법 사용 금지. 순수 텍스트만.
각 버전은 "버전 1:", "버전 2:", "버전 3:"으로 구분.

---

업체 정보:
- 업체명: ${businessInfo.name}
- 업종: ${businessInfo.category}
- 지역: ${businessInfo.region}
- 강점: ${businessInfo.strengths}

릴스 주제: ${subject}
캡션 스타일: ${typeMap[captionType] || captionType}`

    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContentStream(prompt)

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
    console.error('Caption generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
