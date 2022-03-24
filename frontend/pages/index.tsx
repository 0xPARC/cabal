import Head from 'next/head'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Profile } from '@ensdomains/thorin'
import { setupWeb3 } from './web3'

declare let window: any

const isMetaMaskInstalled = () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  const { ethereum } = window
  return Boolean(ethereum && ethereum.isMetaMask)
}

interface Network {
  name: string,
  chainId: number
}

const Network = styled('div')`
  padding: 5px 8px;
  margin-right: 8px;
  color: white;
  background: rgb(73, 179, 147);
  border-radius: 6px;
`

export default function Home() {
  const [metamaskInstalled, setMetamaskInstalled] = useState(false)
  const [address, setAddress] = useState<string | undefined>(undefined)
  const [name, setName] = useState<string | undefined>(undefined)
  const [avatar, setAvatar] = useState<string | undefined>(undefined)
  const [network, setNetwork] = useState<Network | undefined>(undefined)
  const [isWeb3Ready, setIsWeb3Ready] = useState<boolean | undefined>(undefined)

  async function setupProfileInfo(signer, provider){
    const addr = await signer.getAddress()
    setAddress(addr)
    const name = await provider.lookupAddress(addr)
    if (name) {
      setName(name)
      const avatar = await provider.getAvatar(name)
      if (avatar) setAvatar(avatar)
    }
  }

  async function setup(){
    const { signer, provider, network } = await setupWeb3()
    setIsWeb3Ready(true)
    setNetwork(network)
    await setupProfileInfo(signer, provider)
  }

  useEffect(() => {
    const installed = isMetaMaskInstalled()
    setMetamaskInstalled(installed)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <header>
          {address && (
            <div className="fixed top-2.5 right-2.5 p-2.5 flex items-center">
              {network && <Network>{network.name}</Network>}
              <Profile address={address} ensName={name ? name : undefined}avatar={avatar} />
            </div>
          )}
        </header>
        <h1 className="text-6xl font-bold">
          Coming Soon{' '}
          <a className="text-blue-600" href="https://cabal.xyz">
            cabal.xyz
          </a>
        </h1>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          {!address ? (
            <button
              className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={metamaskInstalled ? setup : () => {}}
            >
              {/* TODO disable button when metamask is not installed */}
              {metamaskInstalled
                ? 'Connect to Metamask'
                : 'Metamask not installed'}
            </button>
          ) : (
            'Connected.'
          )}

          {/* <a
            href="https://nextjs.org/docs"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Documentation &rarr;</h3>
            <p className="mt-4 text-xl">
              Find in-depth information about Next.js features and API.
            </p>
          </a> */}
        </div>
      </main>

      {/* <footer className="flex h-24 w-full items-center justify-center border-t">
        <a
          className="flex items-center justify-center"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className="ml-2 h-4" />
        </a>
      </footer> */}
    </div>
  )
}
