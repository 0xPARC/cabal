import Head from 'next/head'
import { useState, useEffect } from 'react'

declare let window: any;

export default function Home() {
  const [metamaskInstalled, setMetamaskInstalled] = useState(false)

  const isMetaMaskInstalled = () => {
    //Have to check the ethereum binding on the window object to see if it's installed
    const { ethereum } = window
    return Boolean(ethereum && ethereum.isMetaMask)
  }

  useEffect(() => {
    const installed = isMetaMaskInstalled()
    setMetamaskInstalled(installed)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Cabal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-blue-600" href="https://nextjs.org">
            Cabal
          </a>
        </h1>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          <button className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700">
            {/* TODO disable button when metamask is not installed */}
            {metamaskInstalled
              ? 'Connect to Metamask'
              : 'Metamask not installed'}
          </button>
        </div>
      </main>
    </div>
  )
}
