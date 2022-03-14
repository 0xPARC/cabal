import Head from 'next/head'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Profile } from '@ensdomains/thorin'

declare let window: any;

const AddressContainer = styled('div')`
  padding: 10px;
  position: fixed;
  top: 10px;
  right: 10px;
`

type AddressProps = { address: string}

function Address({ address }: AddressProps){
  return <AddressContainer></AddressContainer>
}

const isMetaMaskInstalled = () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  const { ethereum } = window
  return Boolean(ethereum && ethereum.isMetaMask)
}

export default function Home() {
  const [metamaskInstalled, setMetamaskInstalled] = useState(false)
  const [address, setAddress] = useState<string|undefined>(undefined)
  const [name, setName] = useState<string|undefined>(undefined)

  async function setupWeb3(){

    const provider = new ethers.providers.Web3Provider(window.ethereum)
  
    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);
    
    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const signer = provider.getSigner();
    
    const addr = await signer.getAddress()
    try {
      const name = await provider.lookupAddress(addr)
      setName(name)
    } catch (_){
    }
    setAddress(addr)
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
        <header>{address && <AddressContainer><Profile address={address} ensName={name ? name : undefined}/></AddressContainer>}</header>
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-blue-600" href="https://nextjs.org">
            ZK collab land
          </a>
        </h1>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          {!address ? <button className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700" onClick={metamaskInstalled ? setupWeb3 : () => {}}>
            {/* TODO disable button when metamask is not installed */}
            {metamaskInstalled
              ? 'Connect to Metamask'
              : 'Metamask not installed'}
          </button> : "Welcome to Cabal!" }
          

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

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <a
          className="flex items-center justify-center"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className="ml-2 h-4" />
        </a>
      </footer>
    </div>
  )
}
