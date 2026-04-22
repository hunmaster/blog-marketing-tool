import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF8F5 0%, #FFFFFF 40%, #FFF3EE 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 배경 장식 원 */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,107,53,0.06)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,107,53,0.04)', display: 'flex' }} />

        {/* 로고 아이콘 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 100,
            height: 100,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #FF6B35 0%, #E85D2C 100%)',
            boxShadow: '0 12px 40px rgba(255,107,53,0.3)',
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 52, color: 'white', fontWeight: 800 }}>글</span>
        </div>

        {/* 타이틀 */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: '#1B1D21',
            marginBottom: 12,
            display: 'flex',
          }}
        >
          글써주는집
        </div>

        {/* 서브 타이틀 */}
        <div
          style={{
            fontSize: 24,
            color: '#6B7280',
            marginBottom: 40,
            display: 'flex',
          }}
        >
          소상공인 마케팅 도우미
        </div>

        {/* 기능 뱃지 */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['블로그 자동 글쓰기', '릴스 캡션 생성', '키워드 추천'].map((text) => (
            <div
              key={text}
              style={{
                display: 'flex',
                padding: '10px 24px',
                borderRadius: 100,
                background: 'white',
                border: '1.5px solid #FFD4C0',
                color: '#E85D2C',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* 하단 문구 */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 16,
            color: '#9CA3AF',
            display: 'flex',
          }}
        >
          사진만 올리면 블로그 글이 뚝딱
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
