import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessInfo, customTopic, apiKey: userApiKey } = body

    const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'API 키가 필요합니다. 설정에서 API 키를 입력해주세요.' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

    const systemPrompt = `당신은 네이버 블로그 SEO 키워드 전문가입니다.

규칙:
1. 소상공인이 블로그에 쓰면 검색 노출에 유리한 키워드를 추천합니다.
2. 키워드를 3가지 그룹으로 나눠주세요:

   메인 키워드 (5개):
   - 검색량이 많고 경쟁이 적당한 핵심 키워드
   - 예: "강남 인테리어", "수원 욕실 리모델링"

   롱테일 키워드 (10개):
   - 더 구체적이고 경쟁이 적은 키워드
   - 예: "강남 30평대 아파트 인테리어 비용", "수원 욕실 리모델링 후기"

   블로그 제목 추천 (5개):
   - 위 키워드를 활용한 실제 블로그 포스팅 제목
   - 클릭하고 싶은 제목으로 작성

3. 각 키워드 옆에 간단한 설명을 붙여주세요 (왜 이 키워드가 좋은지).
4. 지역명 + 업종 조합을 적극 활용하세요.
5. 마크다운 문법 사용 금지. 순수 텍스트로 깔끔하게 정리.
6. AI스러운 표현 금지.`

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `업체 정보:
- 업체명: ${businessInfo.name}
- 업종: ${businessInfo.category}
- 지역: ${businessInfo.region}
- 강점: ${businessInfo.strengths}

${customTopic ? `추가 주제: ${customTopic}` : ''}

위 정보를 바탕으로 블로그 키워드를 추천해주세요.`,
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
    console.error('Keyword generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
