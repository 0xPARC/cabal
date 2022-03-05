import Head from 'next/head'
import { useState, useEffect } from 'react'

declare let window: any;

export default function Home() {
  const [metamaskInstalled, setMetamaskInstalled] = useState(false)
  const [metamaskConnected, setMetamaskConnected] = useState(false)

  useEffect(() => {
    const installed = isMetaMaskInstalled()
    setMetamaskInstalled(installed)
  }, [])

  // TODO: this is only for local dev
  const snapId = `local:http://localhost:8082`;

  const isMetaMaskInstalled = () => {
    const { ethereum } = window
    //Have to check the ethereum binding on the window object to see if it's installed
    return Boolean(ethereum && ethereum.isMetaMask)
  }

  const handleConnect = async () => {
    await window.ethereum.request({
      method: 'wallet_enable',
      params: [{
        wallet_snap: { [snapId]: {} },
      }]
    })
    setMetamaskConnected(true)
  }

  const handleGenerate = async () => {
    try {
      const response = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: [snapId, {
          method: 'generateProof'
        }]
      })
      console.log('Private key byte array (as ints) below:');
      console.log(response);
    } catch (err) {
      console.log('ERROR');
      console.error(err)
      alert('Problem happened: ' + err.message || err)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Cabal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <span className="text-blue-600">
            Cabal
          </span>
        </h1>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          <button
            className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
            onClick={handleConnect}
            disabled={!metamaskInstalled}
          >
            {metamaskInstalled
              ? 'Connect to Metamask'
              : 'Metamask not installed'}
          </button>
        </div>

        {metamaskConnected &&
          <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
            <button
              className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={handleGenerate}
            >
              Generate Proof
            </button>
          </div>
       }
      </main>
    </div>
  )
}
