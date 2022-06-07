import { useState, useEffect, SetStateAction, Dispatch } from 'react'
import { Button } from './Base'
import { MerkleProof } from '../pages/api/verify/[authTokenString]'
import { ZKProofInfo } from '../pages/verify/[authToken]'
import LoadingText from './LoadingText'
import { setupWeb3, getProvider, getSigner, getNetwork } from '../lib/web3'
import { ethers } from 'ethers'
import { bufferToHex } from 'ethereumjs-util'
// import { groth16FullProve } from 'snarkjs'
// const snarkjs = require('snarkjs')

declare let window: any

type Props = {
  updateParent: Dispatch<SetStateAction<ZKProofInfo>>
  merkleRoot: string
  merkleProof: MerkleProof | null
  address: string
}

// for converting privkey to 4-tuple
function bigintToTuple(x) {
  // 2 ** 64
  let mod = 18446744073709551616n
  let ret = [0n, 0n, 0n, 0n]

  var x_temp = x
  for (var idx = 0; idx < 4; idx++) {
    ret[idx] = x_temp % mod
    x_temp = x_temp / mod
  }
  return ret
}

function pubKeyToBigIntChunks(pubkey) {
  // takes in a string (hex) pubkey and converts to bigint chunks
  // ready for circuit consumption
  let [x, y] = pubkeyStrToXY(pubkey)
  return [bigintToTuple(x), bigintToTuple(y)]
}

function pubkeyStrToXY(pk: any) {
  // remove 0x04, then divide in 2
  let pkUnprefixed = pk.substring(4)

  let xStr = pkUnprefixed.substring(0, 64)
  let yStr = pkUnprefixed.substring(64)

  return [BigInt('0x' + xStr), BigInt('0x' + yStr)]
}

export default function SigProofButton({
  updateParent,
  merkleRoot,
  merkleProof,
  address,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false)
  const [zkProof, setZkProof] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const buttonText = loading
    ? 'Generating...'
    : '(Beta) Generate Proof With Signature'

  useEffect(() => {
    updateParent({ zkProof, error, loading, sigProof: true })
  }, [loading, zkProof, error])

  async function generateProof() {
    if (loading) return
    if (!merkleRoot || !merkleProof) return
    if (!merkleProof) return
    // TODO include timeout here for proof generation
    const { provider, signer, network } = await setupWeb3()
    const msgContent = `Authenticating with cabal.xyz for merkle root ${merkleRoot}`
    const flatSig = await signer.signMessage(msgContent)
    let sig = ethers.utils.splitSignature(flatSig)
    // console.log('address', address)
    // console.log('pubkey', pubKey)
    console.log('sig', sig)

    const hashMessage = ethers.utils.hashMessage(msgContent)
    const msgBytes = ethers.utils.arrayify(hashMessage) // create binary hash
    const pubkeyHex = ethers.utils.recoverPublicKey(msgBytes, flatSig)
    console.log(pubkeyHex)

    // let pubKey = ''
    // await window.ethereum
    //   .request({
    //     method: 'eth_getEncryptionPublicKey',
    //     params: [address], // you must have access to the specified account
    //   })
    //   .then((result: any) => {
    //     pubKey = result
    //   })
    // console.log('pubkey is', pubKey)
    // const pubkeyHex = bufferToHex(Buffer.from(pubKey, 'base64'))
    // // const pubkeyHex = Buffer.from(pubKey, 'base64').toString('hex')
    // console.log('pubkey hex is', pubkeyHex)

    // const pubKey = '0xasdfasdf'
    const rTuple = bigintToTuple(BigInt(sig.r))
    const sTuple = bigintToTuple(BigInt(sig.s))
    // const hashMessage = ethers.utils.hashMessage('Hello World')
    const chunkedHash = bigintToTuple(BigInt(hashMessage))
    const pubkeyChunked = pubKeyToBigIntChunks(pubkeyHex)

    const sampleInput = {
      r: rTuple,
      s: sTuple,
      msghash: chunkedHash,
      pubkey: pubkeyChunked,
      merkleRoot: merkleRoot,
      merklePathIndices: merkleProof.merklePathIndices,
      merklePathElements: merkleProof.merklePathElements,
    }

    console.log(sampleInput)
    // eslint-disable-next-line @typescript-eslint/no-redeclare
    interface BigInt {
      /** Convert to BigInt to string form in JSON.stringify */
      toJSON: () => string
    }
    BigInt.prototype['toJSON'] = function () {
      return this.toString()
    }
    console.log(JSON.stringify(sampleInput))

    setLoading(true)
    console.log('After set loading')
    try {
      const wasmPath =
        'https://cabal.sfo3.digitaloceanspaces.com/VerifySigCabal_64-4-10_prod.wasm'
      const zkeyPath =
        'https://cabal.sfo3.digitaloceanspaces.com/VerifySigCabal_64-4-10_prod.zkey'
      console.log('before proof', new Date().toLocaleString())
      const proof = await fetch(`/api/remoteProve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleInput),
      })
        .then((res) => res.json())
        .then((json) => JSON.parse(json))
      // const proof = await snarkjs.groth16.fullProve(
      //   sampleInput,
      //   wasmPath,
      //   zkeyPath
      // )
      console.log('proof generated', new Date().toLocaleString())
      console.log(proof)
      setZkProof(proof)
    } catch (err: any) {
      alert(
        'Problem happened in snap when generating proof: ' + err.message || err
      )
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // TODO disable the button if !merkleProof, hover: "cannot generate proof with merkle proof"
  // TODO disable the button if proofLoading, hover: "proof is generating, be patient"
  return (
    <div className="flex">
      <Button onClick={generateProof}>{buttonText}</Button>
      <div className="mx-10">{loading && <LoadingText />}</div>
    </div>
  )
}
