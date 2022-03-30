import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Data, MerkleProof } from '../api/verify/[authTokenString]'
import Head from 'next/head'
import { Profile } from '@ensdomains/thorin'

import Header from '../components/Header'
import AuthInfo from '../components/AuthInfo'
import SubmitProof from '../components/SubmitProof'

declare let window: any
const snapId = `local:http://localhost:8082`

const AuthToken = () => {
  const router = useRouter()
  const { authToken } = router.query
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Data | null>(null)
  const [metamaskInstalled, setMetamaskInstalled] = useState<boolean>(false)
  const [address, setAddress] = useState<string | undefined>(undefined)
  const [merkleProof, setMerkleProof] = useState<MerkleProof | null>(null)
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
    if (proofLoading) return
    if (!data) return
    if (!merkleProof) return
    // TODO include timeout here for proof generation
    setProofLoading(true)
    await setupSnap()
    try {
      // TODO use query param values inside snap
      // merkleRoot, userId, serverId
      const response = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: [
          snapId,
          {
            method: 'generateProof',
            number: 1,
            merkleRoot: data.configuredConnection.merkleRoot,
            merklePathIndices: merkleProof.merklePathIndices,
            merklePathElements: merkleProof.merklePathElements,
          },
        ],
      })
      setProof(response)
    } catch (err) {
      console.log('ERROR')
      console.error(err)
      alert('Problem happened when generating proof: ' + err.message || err)
    }
    setProofLoading(false)
  }

  const submitProof = () => {
    if (!proof) {
      alert('There is no proof! Something weird is going on.')
      return
    }
    const submitData = async () => {
      console.log('submitting data')
      fetch(`/api/verify/${authToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: proof,
      })
        .then((res) => res.text())
        .then((text) => {
          if (text == 'Valid proof!') setProofValid(true)
          else setProofValid(false)
        })
    }
    submitData()
  }

  return (
    <div className="">
      <Head>
        <title>verify cabal.xyz</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="mx-auto max-w-3xl px-2 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
        <div className="flex items-center space-x-5 space-y-10">
          <div className="flex-shrink-0 text-2xl">
            Get verified with cabal.xyz
          </div>
        </div>
      </div>
      {data && (
        <AuthInfo
          userName={data.user.userName}
          serverName={data.guild.guildName}
          merkleRoot={data.configuredConnection.merkleRoot}
          roleName={data.role.roleName}
        />
      )}
      {data && <SubmitProof />}

      <header>
        <div className="relative flex">
          <div className="flex-1 p-2.5 text-2xl font-bold">cabal.xyz</div>
          <div className="p-2.5">
            {address ? (
              <Profile address={address} ensName={undefined} />
            ) : (
              <button
                className="rounded bg-blue-500 font-bold text-white hover:bg-blue-700"
                onClick={metamaskInstalled ? setupWeb3 : () => {}}
              >
                {metamaskInstalled
                  ? 'Connect to Metamask'
                  : 'Metamask not installed'}
              </button>
            )}
          </div>
        </div>
      </header>
      <h1 className="p-2.5 text-6xl font-bold text-blue-600">
        Get Verified with cabal.xyz
        {/* <a className="text-blue-600" href="https://cabal.xyz">
                {data.user.userName}
              </a> */}
      </h1>
      <main>
        {data && (
          <div className="flex w-full px-20 text-center">
            {/* This is the info card */}
            <div className="border">
              <div>User Name: {data.user.userName} </div>
              <div>Server Name: {data.guild.guildName}</div>
              <div>Merkle Root: {data.configuredConnection.merkleRoot}</div>
              <div>Role: {data.role.roleName}</div>
            </div>

            <div className="border">
              <button
                className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                onClick={() => generateProof()}
              >
                {proofLoading ? `Proof Loading` : `Generate Proof`}
              </button>
              <div>Your proof is:</div>
              <div>{JSON.stringify(proof)} </div>
              <button
                onClick={() => submitProof()}
                className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              >
                Submit Generated Proof
              </button>
            </div>

            {!address && <div> Please connect with metamask </div>}
            {/* TODO edge case where address is not in merkle root */}
            {address && !proof && (
              <div>
                <div>Inputs into proof </div>
                <div>Address: {address}</div>
                <div>Merkle root: {data.configuredConnection.merkleRoot} </div>
                <div>Merkle Proof: {JSON.stringify(merkleProof, null, 2)}</div>
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
                <div>{JSON.stringify(proof)} </div>
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
                <div>{JSON.stringify(proof)} </div>
                <div> The proof is valid: {proofValid ? 'true' : 'false'}</div>
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
