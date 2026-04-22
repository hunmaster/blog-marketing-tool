import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessInfo, style, topic, keywords, photos, apiKey: userApiKey } = body

    const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'API 키가 필요합니다. 설정에서 API 키를 입력해주세요.' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

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
      before: '시공 전',
      after: '시공 후',
      process: '작업 과정',
      result: '완성 결과',
      detail: '디테일 컷',
      space: '매장/공간',
      product: '상품/메뉴',
      etc: '기타',
    }

    // 사진 정보를 텍스트로 정리
    const photoDescriptions: string[] = []
    const contentParts: Anthropic.Messages.ContentBlockParam[] = []

    if (photos && photos.length > 0) {
      // 최대 5장만 이미지로 전송 (토큰 절약)
      const photosToSend = photos.slice(0, 5)

      for (let i = 0; i < photosToSend.length; i++) {
        const photo = photosToSend[i]
        const base64Match = photo.src?.match(/^data:image\/(.*?);base64,(.*)$/)

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

        const roleLabel = roleLabels[photo.role] || '기타'
        const captionText = photo.caption ? ` - ${photo.caption}` : ''
        photoDescriptions.push(`사진 ${i + 1}: [${roleLabel}]${captionText}`)
      }

      // 5장 이후 사진은 텍스트 설명만
      for (let i = 5; i < photos.length; i++) {
        const photo = photos[i]
        const roleLabel = roleLabels[photo.role] || '기타'
        const captionText = photo.caption ? ` - ${photo.caption}` : ''
        photoDescriptions.push(`사진 ${i + 1}: [${roleLabel}]${captionText} (이미지 미첨부)`)
      }
    }

    const photoSection = photoDescriptions.length > 0
      ? `\n\n사진 구성 (사용자가 올린 순서대로):\n${photoDescriptions.join('\n')}`
      : '\n\n(사진 없음 - 텍스트 기반으로 작성)'

    contentParts.push({
      type: 'text',
      text: `블로그 글을 작성해주세요.

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

중요: 사진의 역할(시공 전/후, 작업 과정 등)과 설명을 참고해서 글의 흐름을 구성하세요.
- "시공 전" → "작업 과정" → "시공 후" 순서라면 자연스럽게 변화 과정을 서술
- "비포&애프터"라면 전후 대비를 강조
- 글 중간에 [사진 1], [사진 2] 등으로 사진 삽입 위치를 표시해주세요
- 사용자가 적어준 사진 설명이 있다면 그 내용을 글에 자연스럽게 반영하세요`,
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
11. 사진 삽입 위치는 [사진 1], [사진 2] 형태로 표시하세요. 사진의 역할(시공 전/후 등)에 맞게 글 흐름 속에 자연스럽게 배치하세요.

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
    console.error('Blog generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
