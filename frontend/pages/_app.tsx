import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '@ensdomains/thorin'
import '@ensdomains/thorin/styles'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Head>
        <script src="/snarkjs.min.js" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
