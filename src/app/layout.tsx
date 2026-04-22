import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '글써주는집 - 소상공인 마케팅 도우미',
  description: '사진만 올리면 블로그 글이 뚝딱. 소상공인을 위한 콘텐츠 자동 생성 도구.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
