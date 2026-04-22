import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessInfo, captionType, subject, apiKey: userApiKey } = body

    const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'API 키가 필요합니다. 설정에서 API 키를 입력해주세요.' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

    const typeMap: Record<string, string> = {
      hook: '후킹형: 첫 줄에서 시선을 확 잡는 스타일. 질문이나 놀라운 사실로 시작.',
      story: '스토리형: 작업 과정이나 에피소드를 짧게 풀어내는 스타일.',
      tip: '정보/팁형: 유용한 정보를 간결하게 전달하는 스타일.',
      'before-after': '비포애프터형: 변화의 임팩트를 강조하는 스타일.',
    }

    const systemPrompt = `당신은 인스타그램 릴스 캡션을 써주는 전문가입니다.

규칙:
1. 캡션은 총 4파트로 구성:
   - 후킹 첫 줄 (스크롤 멈추게 하는 한 줄)
   - 본문 2-4줄 (핵심 내용)
   - CTA 1줄 (문의/팔로우 유도)
   - 해시태그 15-20개 (지역태그 + 업종태그 + 트렌드태그)

2. AI 티가 나면 안 됩니다:
   - "다양한", "특별한", "완벽한" 같은 AI 클리셰 금지
   - 너무 깔끔하게 정돈된 문장 금지
   - 실제 사장님이 쓴 것처럼 자연스럽게

3. 해시태그 규칙:
   - 지역 해시태그 3-4개 (예: #강남맛집 #서초구맛집 #강남역근처)
   - 업종 해시태그 5-6개 (예: #수제버거 #햄버거맛집 #버거스타그램)
   - 트렌드/일반 태그 5-6개 (예: #먹스타그램 #오늘뭐먹지 #점심추천)
   - 브랜드 태그 1-2개

4. 캡션 3가지 버전을 만들어주세요. 각각 느낌이 다르게.
5. 마크다운 문법 사용 금지. 순수 텍스트만.`

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `업체 정보:
- 업체명: ${businessInfo.name}
- 업종: ${businessInfo.category}
- 지역: ${businessInfo.region}
- 강점: ${businessInfo.strengths}

릴스 주제: ${subject}
캡션 스타일: ${typeMap[captionType] || captionType}

위 정보를 바탕으로 릴스 캡션 3가지 버전을 만들어주세요.
각 버전은 "버전 1:", "버전 2:", "버전 3:"으로 구분해주세요.`,
      }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (streamError) {
          console.error('Stream error:', streamError)
          const msg = streamError instanceof Error ? streamError.message : 'Stream error'
          controller.enqueue(encoder.encode(`\n\n[오류 발생: ${msg}]`))
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error: unknown) {
    console.error('Caption generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
