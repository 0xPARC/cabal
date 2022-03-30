import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Data, MerkleProof } from '../api/verify/[authTokenString]'
import Head from 'next/head'
import { Profile } from '@ensdomains/thorin'

declare let window: any
const snapId = 'npm:cabal-xyz-snap'

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
  const [textCounter, setTextCounter] = useState<number>(0)
  const [loadingText, setLoadingText] = useState<string>('')
  const [loadingVerified, setLoadingVerified] = useState<boolean>(false)

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
    // TODO eventualy have this served from backend
    const getProof = async () => {
      fetch('/tree.json')
        .then((res) => res.json())
        .then((merkleProofData) => {
          console.log('merkle proof', merkleProofData)
          const myProof = {
            merklePathElements:
              merkleProofData.leafToPathElements[BigInt(address).toString()],
            merklePathIndices:
              merkleProofData.leafToPathIndices[BigInt(address).toString()],
          }
          setMerkleProof(myProof)
        })
    }
    getProof()
  }, [address])

  async function setupSnap() {
    const result = await window.ethereum.request({ method: 'wallet_getSnaps' })
    console.log('setupSnap result', result)
    if (!result || !result.snapId || result.snapId.error) {
      await window.ethereum.request({
        method: 'wallet_enable',
        params: [
          {
            wallet_snap: { [snapId]: {} },
          },
        ],
      })
      const result = await window.ethereum.request({
        method: 'wallet_getSnaps',
      })
      console.log('After setting up snap')
      console.log(result)

      // .then((res: any) => console.log('snap enabled'))
      // .catch((error: any) => alert('Error in requesting snap permissions.'))
    } else {
      console.log('Snap already enabled')
    }
  }

  async function generateProof() {
    if (proofLoading) return
    if (!data) return
    if (!merkleProof) return
    // TODO include timeout here for proof generation
    const setup = await setupSnap()
    setProofLoading(true)
    setTextCounter(0)
    try {
      // TODO use query param values inside snap
      // merkleRoot, userId, serverId
      console.log('Invoking snap method to generating the proof')
      await window.ethereum
        .request({
          method: 'wallet_invokeSnap',
          params: [
            snapId,
            {
              method: 'generateProof',
              merkleRoot: data.configuredConnection.merkleRoot,
              merklePathIndices: merkleProof.merklePathIndices,
              merklePathElements: merkleProof.merklePathElements,
            },
          ],
        })
        .then((response: any) => setProof(response))
        .catch((err: any) => {
          alert(
            'Problem happened in snap when generating proof: ' + err.message ||
              err
          )
        })
    } catch (err) {
      console.log('ERROR')
      console.error(err)
      alert(
        'Problem happened in snap when generating proof: ' + err.message || err
      )
    }
    setProofLoading(false)
    setTextCounter(0)
  }

  const submitProof = () => {
    if (!proof) {
      alert('There is no proof! Something weird is going on.')
      return
    }
    console.log('proof', proof)
    const submitData = async () => {
      setLoadingVerified(true)
      console.log('submitting data')
      fetch(`/api/verify/${authToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proof),
      })
        .then((res) => res.text())
        .then((text) => {
          setLoadingVerified(false)
          if (text == 'Valid proof!') setProofValid(true)
          else setProofValid(false)
        })
    }
    submitData()
  }

  function truncateString(s: string, maxLength: number = 25) {
    if (s.length <= maxLength) return s
    return s.substring(0, maxLength - 3) + '...'
  }
  const answers = [
    'Running magic moon math in the browser',
    "Vitalik probably thinks you're cool for generating a ZK proof",
    'Welcome to the future',
    "Pop quiz: what's the difference between the ate, tate and kate pairing?",
    'Bonus question: are ate, kate, and tate related?',
    "If you think this is slow, why dont' you try computing x^2=...",
  ]

  useEffect(() => {
    if (!proofLoading) return
    setLoadingText(answers[textCounter % answers.length])
  }, [textCounter, proofLoading])

  useEffect(() => {
    const timer = setInterval(() => {
      setTextCounter((prevCount) => prevCount + 1) // <-- Change this line!
    }, 5000)
    return () => {
      clearInterval(timer)
    }
  }, []) // Pass in empty array to run effect only once!

  return (
    <div className="flex">
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
            <h1 className="pb-10 pt-40 text-5xl font-bold text-blue-600">
              cabal.xyz
              {/* <a className="text-blue-600" href="https://cabal.xyz">
                {data.user.userName}
              </a> */}
            </h1>
            <div className="py-5">
              <h1 className="text-2xl font-bold text-gray-900">
                Authentication Info
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Username:{' '}
                <span className="text-gray-900">{data.user.userName}</span>
              </p>
              <p className="text-sm font-medium text-gray-500">
                Discord Server:{' '}
                <span className="text-gray-900">{data.guild.guildName}</span>
              </p>
              <p className="text-sm font-medium text-gray-500">
                Discord Role:{' '}
                <span className="text-gray-900">{data.role.roleName}</span>
              </p>
              <p className="text-sm font-medium text-gray-500">
                Merkle Root:{' '}
                <span className="text-gray-900">
                  {truncateString(data.configuredConnection.merkleRoot)}
                </span>
              </p>
            </div>
            {/* <div className="border">
              <div>User Name: {data.user.userName} </div>
              <div>Server Name: {data.guild.guildName}</div>
              <div>Merkle Root: {data.configuredConnection.merkleRoot}</div>
              <div>Role: {data.role.roleName}</div>
            </div> */}

            {!address && (
              <div className="py-10"> Please connect with metamask </div>
            )}
            {/* TODO edge case where address is not in merkle root */}
            {address && !proof && (
              <div className="py-10">
                <h1 className="text-2xl font-bold text-gray-900">
                  Inputs into proof
                </h1>
                <p className="text-sm font-medium text-gray-500">
                  Address: <span className="text-gray-900">{address}</span>
                </p>
                <p className="text-sm font-medium text-gray-500">
                  Merkle Root:{' '}
                  <span className="text-gray-900">
                    {truncateString(data.configuredConnection.merkleRoot)}
                  </span>
                </p>
                <p className="text-sm font-medium text-gray-500">
                  Merkle Proof:{' '}
                  <span className="text-gray-900">
                    {truncateString(JSON.stringify(merkleProof, null, 2))}
                  </span>
                </p>
              </div>
              // <div>
              //   <div>Inputs into proof </div>
              //   <div>Address: {address}</div>
              //   <div>Merkle root: {data.configuredConnection.merkleRoot} </div>
              //   <div>Merkle Proof: {JSON.stringify(merkleProof, null, 2)}</div>
              // </div>
            )}
            {address && !proof && proofLoading && (
              <div>
                <div className="py-2 px-4">Generating Proof...</div>
                <div className="py-2 px-4 font-bold">{loadingText}</div>
              </div>
            )}
            {address && !proof && !proofLoading && (
              <button
                className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                onClick={() => generateProof()}
              >
                {`Generate Proof`}
              </button>
            )}
            {address && proof && proofValid === null && (
              <div className="">
                <div className="py-10">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Computed Proof
                  </h1>
                  <p className="text-sm font-medium text-gray-500">
                    Proof:{' '}
                    <span className="text-gray-900">
                      {truncateString(JSON.stringify(proof))}
                    </span>
                  </p>
                </div>
              </div>
            )}
            {address && proof && proofValid === null && !loadingVerified && (
              <button
                onClick={() => submitProof()}
                className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              >
                Submit Generated Proof
              </button>
            )}
            {address && proof && proofValid === null && loadingVerified && (
              <div className="">Server is verifying proof...</div>
            )}
            {address && proof && proofValid !== null && proofValid && (
              <div className="">
                <div>Your proof was verified. Please go back to discord!</div>
              </div>
            )}
            {address && proof && proofValid !== null && !proofValid && (
              <div className="">
                <div>
                  The server COULD NOT verify this proof. Are you doing
                  something sneaky?
                </div>
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
