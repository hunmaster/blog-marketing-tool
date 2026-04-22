import { NextRequest } from 'next/server'

// 네이버 자동완성 API (무료, 인증 불필요)
async function fetchAutoComplete(keyword: string): Promise<string[]> {
  try {
    const url = `https://ac.search.naver.com/nx/ac?q=${encodeURIComponent(keyword)}&con=1&frm=nv&ans=2&r_format=json&r_enc=UTF-8&r_unicode=0&t_koreng=1&run=2&rev=4&q_enc=UTF-8`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://m.search.naver.com/',
      },
    })
    if (!res.ok) return []
    const data = await res.json()
    // data.items 는 [[키워드배열], [키워드배열]] 형태
    const items = data.items || []
    const keywords: string[] = []
    for (const group of items) {
      if (Array.isArray(group)) {
        for (const item of group) {
          if (Array.isArray(item) && item[0]) {
            keywords.push(item[0])
          }
        }
      }
    }
    return keywords.slice(0, 20)
  } catch {
    return []
  }
}

// 네이버 모바일 검색 결과 수 크롤링 (경쟁도 추정)
async function fetchSearchResultCount(keyword: string): Promise<{ blog: number; total: string }> {
  try {
    const url = `https://m.search.naver.com/search.naver?query=${encodeURIComponent(keyword)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://m.naver.com/',
      },
    })
    if (!res.ok) return { blog: 0, total: '0' }
    const html = await res.text()

    // 블로그 탭 결과 수 추출 시도
    let blogCount = 0
    const blogMatch = html.match(/블로그[^<]*?(\d[\d,]+)/)
    if (blogMatch) {
      blogCount = parseInt(blogMatch[1].replace(/,/g, ''))
    }

    // 전체 검색결과 수
    let totalStr = '0'
    const totalMatch = html.match(/(\d[\d,]+)\s*건/)
    if (totalMatch) {
      totalStr = totalMatch[1]
    }

    return { blog: blogCount, total: totalStr }
  } catch {
    return { blog: 0, total: '0' }
  }
}

// 네이버 검색광고 키워드 도구 (비공식, 검색량 추정)
async function fetchRelSearchVolume(keyword: string): Promise<string> {
  try {
    const url = `https://m.search.naver.com/search.naver?where=m&query=${encodeURIComponent(keyword)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
    })
    if (!res.ok) return '측정불가'
    const html = await res.text()

    // 검색결과 구조로 인기도 추정
    const hasViewTab = html.includes('data-tab="view"') || html.includes('>VIEW<')
    const hasBlogSection = html.includes('blog_') || html.includes('블로그')
    const hasCafeSection = html.includes('cafe_') || html.includes('카페')
    const hasAdSection = html.includes('powerlink') || html.includes('ad_')

    let score = 0
    if (hasViewTab) score += 2
    if (hasBlogSection) score += 1
    if (hasCafeSection) score += 1
    if (hasAdSection) score += 3 // 광고가 있으면 검색량 많음

    if (score >= 5) return '검색량 높음'
    if (score >= 3) return '검색량 보통'
    if (score >= 1) return '검색량 낮음'
    return '측정불가'
  } catch {
    return '측정불가'
  }
}

export type KeywordData = {
  keyword: string
  volume: string
  blogCount: number
  totalResults: string
  competition: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { baseKeyword, region, category } = body

    if (!baseKeyword) {
      return Response.json({ error: '키워드를 입력해주세요.' }, { status: 400 })
    }

    // 1단계: 자동완성으로 연관 키워드 수집
    const seedKeywords = [baseKeyword]
    if (region) seedKeywords.push(`${region} ${baseKeyword}`)
    if (category) seedKeywords.push(`${baseKeyword} ${category}`)

    const allAutoComplete = new Set<string>()
    allAutoComplete.add(baseKeyword)
    if (region) allAutoComplete.add(`${region} ${baseKeyword}`)

    for (const seed of seedKeywords) {
      const suggestions = await fetchAutoComplete(seed)
      suggestions.forEach((s) => allAutoComplete.add(s))
      // 네이버 차단 방지 딜레이
      await new Promise((r) => setTimeout(r, 300))
    }

    const keywordList = Array.from(allAutoComplete).slice(0, 15)

    // 2단계: 각 키워드별 검색량/경쟁도 분석
    const results: KeywordData[] = []

    for (const kw of keywordList) {
      const [searchResult, volumeEst] = await Promise.all([
        fetchSearchResultCount(kw),
        fetchRelSearchVolume(kw),
      ])

      let competition = '낮음'
      if (searchResult.blog > 100000) competition = '매우 높음'
      else if (searchResult.blog > 30000) competition = '높음'
      else if (searchResult.blog > 10000) competition = '보통'
      else if (searchResult.blog > 3000) competition = '낮음'
      else competition = '매우 낮음'

      results.push({
        keyword: kw,
        volume: volumeEst,
        blogCount: searchResult.blog,
        totalResults: searchResult.total,
        competition,
      })

      await new Promise((r) => setTimeout(r, 500))
    }

    // 3단계: 점수 기반 정렬 (검색량 높고 경쟁 낮은 순)
    const scored = results.map((r) => {
      let volScore = 0
      if (r.volume === '검색량 높음') volScore = 3
      else if (r.volume === '검색량 보통') volScore = 2
      else if (r.volume === '검색량 낮음') volScore = 1

      let compScore = 0
      if (r.competition === '매우 낮음') compScore = 4
      else if (r.competition === '낮음') compScore = 3
      else if (r.competition === '보통') compScore = 2
      else if (r.competition === '높음') compScore = 1

      return { ...r, score: volScore * 2 + compScore }
    })

    scored.sort((a, b) => b.score - a.score)

    return Response.json({
      keywords: scored,
      baseKeyword,
      totalFound: scored.length,
    })
  } catch (error: unknown) {
    console.error('Keyword research error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
