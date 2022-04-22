import Head from 'next/head'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Profile } from '@ensdomains/thorin'
import { setupWeb3 } from '../lib/web3'
import { useRouter } from 'next/router'
import { validateQueryParams } from '../lib/utils'
import Action from '../components/Action'

declare let window: any

const isMetaMaskInstalled = () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  const { ethereum } = window
  return Boolean(ethereum && ethereum.isMetaMask)
}

interface Network {
  name: string
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
  const router = useRouter()
  const [metamaskInstalled, setMetamaskInstalled] = useState(false)
  const [address, setAddress] = useState<string | undefined>(undefined)
  const [name, setName] = useState<string | undefined>(undefined)
  const [avatar, setAvatar] = useState<string | undefined>(undefined)
  const [network, setNetwork] = useState<Network | undefined>(undefined)
  const [metamaskConnected, setMetamaskConnected] = useState(false)
  const [generatingProof, setGeneratingProof] = useState(false)
  const [proof, setProof] = useState<string | undefined>(undefined)

  const { merkleRoot, userId, serverId } = router.query
  const hasValidProofInput = validateQueryParams(merkleRoot, userId, serverId)

  // TODO: this is only for local dev
  const snapId = `local:http://localhost:8082`

  async function setupProfileInfo(signer: any, provider: any) {
    const addr = await signer.getAddress()
    setAddress(addr)
    const name = await provider.lookupAddress(addr)
    if (name) {
      setName(name)
      const avatar = await provider.getAvatar(name)
      if (avatar) setAvatar(avatar)
    }
  }

  async function setup() {
    const { signer, provider, network } = await setupWeb3()
    setNetwork(network)

    await setupProfileInfo(signer, provider)
    setMetamaskConnected(true)
    await setupSnap()
    setMetamaskConnected(true)
  }

  // Get permissions to interact with and install the snap
  async function setupSnap() {
    await window.ethereum.request({
      method: 'wallet_enable',
      params: [
        {
          wallet_snap: { [snapId]: {} },
        },
      ],
    })
  }

  async function generateProof() {
    try {
      // TODO use query param values inside snap
      // merkleRoot, userId, serverId
      setGeneratingProof(true)
      const response = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: [
          snapId,
          {
            method: 'generateProof',
          },
        ],
      })
      setGeneratingProof(false)
      setProof(response)
    } catch (err) {
      console.log('ERROR')
      console.error(err)
      alert('Problem happened: ' + err.message || err)
    }
  }

  function submitProof() {
    console.log('submitting proof')
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <header>
          {address && (
            <div className="fixed top-2.5 right-2.5 flex items-center p-2.5">
              {network && <Network>{network.name}</Network>}
              <Profile
                address={address}
                ensName={name ? name : undefined}
                avatar={avatar}
              />
            </div>
          )}
        </header>
        <h1 className="text-6xl font-bold">
          Coming soon{' '}
          <a className="text-blue-600" href="https://cabal.xyz">
            cabal.xyz 👻
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
          {console.log(metamaskConnected)}

          {false && metamaskConnected && hasValidProofInput && (
            <Action
              onClick={generateProof}
              loading={generatingProof}
              loadingText="Generating Proof..."
              completed={!!proof}
              completedText="Proof generated"
            >
              Generate Proof
            </Action>
          )}

          {false && !hasValidProofInput && (
            <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
              No proof input detected.
            </div>
          )}

          {false && metamaskConnected && proof && (
            <Action
              onClick={submitProof}
              loading={false}
              loadingText="Submitting Proof..."
              completed={false}
              completedText="Proof verified!"
            >
              Submit Proof
            </Action>
          )}
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
