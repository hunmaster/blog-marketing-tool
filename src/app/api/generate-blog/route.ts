import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessInfo, style, topic, keywords, photoCount, photos } = body

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

    // 사진 분석을 위한 content 구성
    const contentParts: Anthropic.Messages.ContentBlockParam[] = []

    // 사진이 있으면 Vision으로 분석
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        const base64Match = photo.match(/^data:image\/(.*?);base64,(.*)$/)
        if (base64Match) {
          contentParts.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: `image/${base64Match[1]}` as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: base64Match[2],
            },
          })
        }
      }
    }

    contentParts.push({
      type: 'text',
      text: `위 사진들을 참고해서 블로그 글을 작성해주세요.

업체 정보:
- 업체명: ${businessInfo.name}
- 업종: ${businessInfo.category}
- 지역: ${businessInfo.region}
- 강점: ${businessInfo.strengths}

글 요청:
- 글 스타일: ${styleMap[style] || style}
- 주제: ${topic || '사진 내용을 바탕으로 자유롭게'}
- 넣어야 할 키워드: ${keywords || '없음'}
- 업로드된 사진 수: ${photoCount}장

사진이 있다면 사진 속 내용(시공 현장, 음식, 매장 등)을 자연스럽게 묘사해주세요.
글 중간중간에 [사진] 이라고 표시해서 사진 넣을 위치를 알려주세요.`,
    })

    const systemPrompt = `당신은 소상공인의 네이버 블로그 글을 대신 써주는 작성자입니다.

핵심 규칙:
1. ${toneMap[businessInfo.tone] || toneMap.friendly}
2. 절대 AI가 쓴 티가 나면 안 됩니다. 아래 금지어를 사용하지 마세요:
   - "다양한", "특별한", "완벽한", "훌륭한", "놀라운", "획기적인"
   - "또한", "더불어", "뿐만 아니라", "나아가", "한편"
   - "~하는 것이 중요합니다", "~할 수 있습니다"
   - "소개해드리겠습니다", "알려드리겠습니다"
3. 매번 다른 도입부를 사용하세요. "안녕하세요 ○○입니다"로 시작하지 마세요.
4. 문장 길이를 섞으세요. 짧은 문장과 긴 문장을 번갈아 사용하세요.
5. 자연스러운 감탄, 고민, 에피소드를 넣어서 사람이 쓴 느낌을 내세요.
6. 글 분량은 1500~2500자 사이로 작성하세요.
7. 키워드가 있다면 자연스럽게 3-5회 반복하되, 억지로 끼워넣지 마세요.
8. 소제목은 2-3개 정도만 사용하고, 없이 쓰는 것도 괜찮습니다.
9. 네이버 블로그에 바로 붙여넣기 할 수 있도록 깔끔하게 작성하세요.
10. 연락처 유도 문구는 글 마지막에 자연스럽게 한 번만 넣으세요.

절대 하지 말 것:
- 마크다운 문법(#, **, - 등) 사용 금지. 순수 텍스트로만 작성.
- 이모지 과다 사용 금지 (최대 3-4개만).
- "이상으로 ○○에 대해 알아보았습니다" 같은 뻔한 마무리 금지.`

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: contentParts }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error: unknown) {
    console.error('Blog generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
