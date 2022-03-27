import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Data } from '../api/verify/[authTokenString]'
import Head from 'next/head'
import { Profile } from '@ensdomains/thorin'

declare let window: any

const AuthToken = () => {
  const router = useRouter()
  const { authToken } = router.query
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Data | null>(null)
  const [metamaskInstalled, setMetamaskInstalled] = useState<boolean>(false)
  const [address, setAddress] = useState<string | undefined>(undefined)
  const [merkleProof, setMerkleProof] = useState<string[] | null>(null)
  const [proof, setProof] = useState<string | null>(null)
  const [proofLoading, setProofLoading] = useState<boolean>(false)
  const [submittedProof, setSubmittedProof] = useState<boolean>(false)
  const [proofValid, setProofValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (!authToken) return
    const fetchData = async () => {
      fetch(`/api/verify/${authToken}`).then((res) => {
        if (res.ok) {
          res.json().then((data) => setData(data))
          setError(null)
        } else {
          res.json().then((data) => setError(data.error))
          setData(null)
        }
      })
    }
    fetchData()
  }, [authToken])

  async function setupWeb3() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // MetaMask requires requesting permission to connect users accounts
    await provider.send('eth_requestAccounts', [])

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const signer = provider.getSigner()

    const addr = await signer.getAddress()
    const name = await provider.lookupAddress(addr)
    // if (name) setName(name)
    setAddress(addr)
  }

  useEffect(() => {
    const { ethereum } = window
    const installed = Boolean(ethereum && ethereum.isMetaMask)
    setMetamaskInstalled(installed)
  }, [])

  useEffect(() => {
    if (!address) return
    if (data?.merkleProofsByAddr[address]) {
      setMerkleProof(data.merkleProofsByAddr[address])
    }
  }, [address])

  const generateProof = () => {
    if (proofLoading) return
    // TODO include timeout here for proof generation
    setProofLoading(true)
    alert(`Pretend this is a metamask pop-up!`)
    setProof('{zkey: ..., vkey: ...}')
    setProofLoading(false)
  }

  const submitProof = () => {
    if (!proof) {
      alert('There is no proof! Something weird is going on.')
      return
    }
    const submitData = async () => {
      // TODO post request
      console.log('submitting data')
      fetch(`/api/verify/${authToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofText: 'this is a proof' }),
      }).then((res) => {
        if (res.ok) {
          setProofValid(true)
        } else {
          setProofValid(false)
        }
      })
    }
    submitData()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>verify cabal.xyz</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <header>
          {address ? (
            <div className="fixed top-2.5 right-2.5 p-2.5">
              <Profile address={address} ensName={undefined} />
            </div>
          ) : (
            <button
              className="fixed top-2.5 right-2.5 rounded bg-blue-500 p-2.5 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={metamaskInstalled ? setupWeb3 : () => {}}
            >
              {metamaskInstalled
                ? 'Connect to Metamask'
                : 'Metamask not installed'}
            </button>
          )}
        </header>

        {data && (
          <div>
            <h1 className="text-6xl font-bold text-blue-600">
              Generating verification
              {/* <a className="text-blue-600" href="https://cabal.xyz">
                {data.user.userName}
              </a> */}
            </h1>
            <div className="border">
              <div>User Name: {data.user.userName} </div>
              <div>Server Name: {data.guild.guildName}</div>
              <div>Merkle Root: {data.configuredConnection.merkleRoot}</div>
              <div>Role: {data.role.roleName}</div>
            </div>

            {!address && <div> Please connect with metamask </div>}
            {/* TODO edge case where address is not in merkle root */}
            {address && !proof && (
              <div>
                <div>Inputs into proof </div>
                <div>Address: {address}</div>
                <div>Merkle root: {data.configuredConnection.merkleRoot} </div>
                <div>Merkle Proof: {merkleProof}</div>
              </div>
            )}
            {address && !proof && (
              <button
                className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                onClick={() => generateProof()}
              >
                {proofLoading ? `Proof Loading` : `Generate Proof`}
              </button>
            )}
            {address && proof && proofValid === null && (
              <div className="border">
                <div>Your proof is:</div>
                <div>{proof} </div>
                <button
                  onClick={() => submitProof()}
                  className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                >
                  Submit Generated Proof
                </button>
              </div>
            )}
            {address && proof && proofValid !== null && (
              <div className="border">
                <div>Your proof is:</div>
                <div>{proof} </div>
                <div> The proof is {proofValid ? 'true' : 'false'}</div>
              </div>
            )}
          </div>
        )}
        {error && <div>Error {error}</div>}
        {!data && !error && <div>Loading...</div>}
      </main>
    </div>
  )
}

export default AuthToken
