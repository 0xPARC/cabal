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



const SignUp = () => {
  const router = useRouter()
  const { club } = router.query

  const [address, setAddress] = useState<string | null>(null)

  const connectToMetamask = () => {
    const connectToMetamaskAsync = async () => {
      const { provider, signer, network } = await setupWeb3()
      const msg = await signer.signMessage("Committing to public note adsf for cabal.xyz")
      console.log(msg)
      setAddress(msg)
    }
    connectToMetamaskAsync()
  }
  
  return (
    <div className="h-screen">
      <Head>
        <title>Cabal Sign Up</title>
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
        {/* <div>Spacer</div> */}
        <div className="items-center justify-center self-center">
          <div className="flex">
            <Stepper>Signing Up For Club {club}</Stepper>
          </div>
          <div className="m-10">

            <div className="py-5">
              <Button onClick={connectToMetamask}>Connect</Button>
              <label
                htmlFor="comment"
                className="block font-bold text-terminal-green"
              >
                Sign Up for Club {club}
              </label>
              <div className="mt-1">
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default SignUp
