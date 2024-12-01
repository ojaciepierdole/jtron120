import { Html, Head, Main, NextScript } from 'next/document'
import type { DocumentProps } from 'next/document'

export default function Document(props: DocumentProps) {
  return (
    <Html lang="pl">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 