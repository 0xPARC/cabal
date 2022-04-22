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

import dynamic from 'next/dynamic'
const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false })

declare let window: any
const snapId = 'npm:cabal-xyz-snap'

const getStep = (
  zkProof: string | undefined,
  proofVerifiedInfo: ProofVerifiedInfo | null
) => {
  if (!zkProof) return 1
  if (!proofVerifiedInfo?.submitted) return 2
  return 3
}

const TITLES = ['Enter your ZK proof']

export type ProofVerifiedInfo = {
  submitted: boolean
  proofValid: boolean | null
  error: string
  loading: boolean
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
  const [zkProof, setZkProof] = useState<string | undefined>()
  const [parsedProof, setParsedProof] = useState<any>(null)
  const [parseError, setParseError] = useState<string>('')

  const [proofVerifiedInfo, setProofVerifiedInfo] =
    useState<ProofVerifiedInfo | null>(null)

  const step = getStep(zkProof, proofVerifiedInfo)

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

  const openSlideOver = (slideoverContent: any, title: string) => {
    setSlideoverTitle(title)
    setSlideroverContent(slideoverContent)
    setSlideoverOpen(true)
  }

  const onEnter = (enteredText: string) => {
    // TODO validate here
    console.log(enteredText)
    setZkProof(enteredText)
    try {
      const parse = JSON.parse(enteredText)
      setParsedProof(parse)
      setParseError('')
    } catch (e: any) {
      console.log(e)
      setParsedProof(null)
      setParseError(e.toString())
    }
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
      <div className="-mt-24 flex h-full items-center justify-center bg-black p-20 text-white	">
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
        <div className="items-center justify-center self-center">
          <div className="flex">
            <Stepper>ZK Verification (Local Proving)</Stepper>
          </div>
          {step < 3 && <Title> {TITLES[0]} </Title>}
          {step === 3 && proofVerifiedInfo && (
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
            <div className="py-5">
              <label
                htmlFor="comment"
                className="block font-bold text-terminal-green"
              >
                Enter your ZK Proof
              </label>
              <div className="mt-1">
                <textarea
                  rows={4}
                  name="comment"
                  id="comment"
                  className="block w-full resize-none rounded-md border-gray-300 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm	"
                  // defaultValue={'This is the default'}
                  onChange={(event) => onEnter(event.target.value)}
                  value={zkProof}
                />
              </div>
            </div>
            {parseError && (
              <div className="max-w-lg">
                <InfoRow
                  name="Error in parsing"
                  content={parseError}
                  color="text-red-500"
                />
              </div>
            )}
            {step === 2 && (
              <div>
                {parsedProof && (
                  <InfoRow
                    name="ZK Proof"
                    content={
                      <span
                        onClick={() => openSlideOver(parsedProof, 'ZK Proof')}
                        className="hover:cursor-pointer hover:text-terminal-green"
                      >
                        {/* {JSON.stringify(zkProofInfo.zkProof)} */}
                        Click to view
                      </span>
                    }
                  />
                )}
              </div>
            )}
          </div>
          {parsedProof && (
            <SubmitButton
              updateParent={setProofVerifiedInfo}
              zkProof={JSON.stringify(parsedProof)}
              authToken={authToken as string}
            />
          )}
          {!parsedProof && (
            <Button className="bg-slate-500 cursor-not-allowed text-red-500">
              {zkProof === undefined || zkProof === ''
                ? 'No Input'
                : 'Invalid Input'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthToken
