import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import {
  Data,
  MerkleProof,
  ProofSubmissionResult,
} from '../api/verify/[authTokenString]'
import Head from 'next/head'
import { Profile } from '@ensdomains/thorin'
import { Wrapper, Stepper, Title, Button } from '../../components/Base'
import Tooltip from '../../components/Tooltip'
import { setupWeb3, getProvider, getSigner, getNetwork } from '../../lib/web3'
import { useMerkleProof } from '../../lib/utils'
import InfoRow from '../../components/InfoRow'
import ProofButton from '../../components/ProofButton'
import SubmitButton from '../../components/SubmitButton'
import Slideover from '../../components/Slideover'
import LoadingText from '../../components/LoadingText'
import { UploadIcon } from '@heroicons/react/solid'
import Image from 'next/image'
import Link from 'next/link'

import dynamic from 'next/dynamic'
const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false })

declare let window: any
const snapId = 'npm:cabal-xyz-snap'

const getStep = (
  metamaskAddress: string | null,
  zkProof: string | null,
  proofVerifiedInfo: ProofVerifiedInfo | null
) => {
  if (!metamaskAddress) return 1
  if (!zkProof) return 2
  if (!proofVerifiedInfo?.submitted) return 3
  return 4
}

const TITLES = [
  'Please connect with Metamask',
  'Start generating a ZK proof',
  'Your ZK proof is ready to go',
]

export type ZKProofInfo = {
  zkProof: string | null
  error: string | null
  loading: boolean
}

export type ProofVerifiedInfo = {
  submitted: boolean
  proofValid: boolean | null
  error: string
  loading: boolean
}

function truncateString(s: string, maxLength: number = 25) {
  if (s.length <= maxLength) return s
  return s.substring(0, maxLength - 3) + '...'
}

const getTitleTextProofVerificationStep = (
  proofVerifiedInfo: ProofVerifiedInfo
) => {
  if (proofVerifiedInfo.loading) return '⌛ Verifying Proof...'
  if (proofVerifiedInfo.error) return '❌ Error in verification ❌'
  if (!proofVerifiedInfo.proofValid) return '❌ Proof Invalid ❌'
  return '✅ Verified! Head back to Discord ✅'
}

const AuthToken = () => {
  const router = useRouter()
  const { authToken } = router.query

  const [slideoverOpen, setSlideoverOpen] = useState<boolean>(false)
  const [slideoverContent, setSlideroverContent] = useState<any | null>(null)
  const [slideoverTitle, setSlideoverTitle] = useState<string>('')

  const [authTokenData, setAuthTokenData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [metamaskAddress, setMetamaskAddress] = useState<string | null>(null)
  const {
    merkleProof,
    loading: merkleProofLoading,
    error: merkleProofError,
  } = useMerkleProof(authTokenData, metamaskAddress)
  const [zkProofInfo, setZkProofInfo] = useState<ZKProofInfo>({
    zkProof: null,
    error: null,
    loading: false,
  })

  const [proofVerifiedInfo, setProofVerifiedInfo] =
    useState<ProofVerifiedInfo | null>(null)

  const step = getStep(metamaskAddress, zkProofInfo.zkProof, proofVerifiedInfo)

  // TODO extract this into custom effect with loading & error
  useEffect(() => {
    if (!authToken) return
    const fetchData = async () => {
      fetch(`/api/verify/${authToken}`).then((res) => {
        if (res.ok) {
          res.json().then((data) => setAuthTokenData(data))
          setError(null)
        } else {
          res.json().then((data) => setError(data.error))
          setAuthTokenData(null)
        }
      })
    }
    fetchData()
  }, [authToken])

  const connectToMetamask = () => {
    const connectToMetamaskAsync = async () => {
      const { provider, signer, network } = await setupWeb3()
      // console.log(provider, signer, network)
      const addr = await signer.getAddress()
      console.log(addr)
      setMetamaskAddress(addr)
    }
    connectToMetamaskAsync()
  }

  const openSlideOver = (slideoverContent: any, title: string) => {
    setSlideoverTitle(title)
    setSlideroverContent(slideoverContent)
    setSlideoverOpen(true)
  }

  return (
    <div className="h-screen">
      <Head>
        <title>verify cabal.xyz</title>
        <link rel="icon" href="/cabal_favicon.png" />
      </Head>
      <div className="flex p-5">
        <Image src="/logo.png" alt="cabal" width="64" height="64" />
        <div className="flex items-center justify-center px-5 text-lg text-white">
          <a href="/" className="hover:text-gray-400">
            cabal.xyz
          </a>
        </div>
      </div>
      <div className="-mt-24 flex h-full items-center justify-center bg-black p-20 text-white">
        {/* <button onClick={() => setSlideoverOpen(true)}>Test Button</button> */}
        <Slideover
          open={slideoverOpen}
          setOpen={setSlideoverOpen}
          title={slideoverTitle}
        >
          {slideoverContent && (
            <DynamicReactJson
              src={slideoverContent}
              name={null}
              indentWidth={2}
              displayDataTypes={false}
              displayArrayKey={false}
            />
          )}
        </Slideover>
        {/* <div>Spacer</div> */}
        <div className="items-center justify-center	self-center">
          <div className="flex justify-between">
            <Stepper>ZK Verification STEP {step}/4</Stepper>
            <div className="flex items-center justify-center px-2">
              <span className="p-2">
                <UploadIcon width={16} height={16} />
              </span>
              <Link href={`/localproof/${authToken}`}>
                <a className="text-s hover:text-gray-400">
                  {'Upload Local Proof'}
                </a>
              </Link>
            </div>
          </div>
          {step < 4 && <Title> {TITLES[step - 1]} </Title>}
          {step === 4 && proofVerifiedInfo && (
            <Title>
              {getTitleTextProofVerificationStep(proofVerifiedInfo)}
            </Title>
          )}
          <div className="m-10">
            {!authTokenData && (
              <InfoRow name="Loading" content="..." color="text-yellow-500" />
            )}
            {authTokenData && (
              <div>
                <InfoRow
                  name="Username"
                  content={authTokenData?.user.userName}
                />
                <InfoRow
                  name="Server Name"
                  content={authTokenData?.guild.guildName}
                />
                <InfoRow name="Role" content={authTokenData?.role.roleName} />

                <InfoRow
                  name="Merkle Root"
                  content={
                    <Tooltip
                      text={authTokenData?.configuredConnection.merkleRoot}
                    />
                  }
                />
              </div>
            )}
            {step >= 2 &&
              metamaskAddress && ( // If step >= 2, then metamask Address is defined
                <div>
                  <InfoRow name="Address" content={metamaskAddress} />
                  {merkleProofLoading && (
                    <InfoRow
                      name="Loading"
                      content="Merkle Proof Computing"
                      color="text-yellow-500"
                    />
                  )}
                  {merkleProofError && (
                    <InfoRow
                      name="Error"
                      content={merkleProofError}
                      color="text-red-500"
                    />
                  )}
                  {merkleProof && (
                    <InfoRow
                      name="Merkle Proof"
                      content={
                        <span
                          onClick={() =>
                            openSlideOver(merkleProof, 'Merkle Proof')
                          }
                          className="hover:cursor-pointer hover:text-terminal-green"
                        >
                          Click to view
                          {/* {JSON.stringify(merkleProof)} */}
                        </span>
                      }
                    />
                  )}
                </div>
              )}
            {step >= 3 && (
              <div>
                {zkProofInfo.zkProof && (
                  <InfoRow
                    name="ZK Proof"
                    content={
                      <span
                        onClick={() =>
                          openSlideOver(zkProofInfo.zkProof, 'ZK Proof')
                        }
                        className="hover:cursor-pointer hover:text-terminal-green"
                      >
                        {/* {JSON.stringify(zkProofInfo.zkProof)} */}
                        Click to view
                      </span>
                    }
                  />
                )}
                {zkProofInfo.error && (
                  <InfoRow
                    name="Error"
                    content={zkProofInfo.error}
                    color="text-red-500"
                  />
                )}
              </div>
            )}
          </div>
          {step === 1 && <Button onClick={connectToMetamask}>Connect</Button>}
          {step === 2 && (
            <ProofButton
              updateParent={setZkProofInfo}
              merkleRoot={authTokenData?.configuredConnection.merkleRoot || ''}
              merkleProof={merkleProof}
            />
          )}
          {step >= 3 && (
            <SubmitButton
              updateParent={setProofVerifiedInfo}
              zkProof={zkProofInfo.zkProof}
              authToken={authToken as string}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthToken
