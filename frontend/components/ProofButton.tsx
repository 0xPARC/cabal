import { useState, useEffect, SetStateAction, Dispatch } from 'react'
import { Button } from './Base'
import { MerkleProof } from '../pages/api/verify/[authTokenString]'
import { ZKProofInfo } from '../pages/verify2/[authToken]'
import LoadingText from './LoadingText'

declare let window: any
const snapId = 'npm:cabal-xyz-snap'

async function setupSnap() {
  const result = await window.ethereum.request({ method: 'wallet_getSnaps' })
  console.log('getSnaps result:', result)
  if (!result?.[snapId]?.id) {
    // snap isn't installed
    console.log('Installing snap')
    await window.ethereum.request({
      method: 'wallet_enable',
      params: [
        {
          wallet_snap: { [snapId]: {} },
        },
      ],
    })
    // .then((res: any) => console.log('snap enabled'))
    // .catch((error: any) => alert('Error in requesting snap permissions.'))
  } else {
    console.log('snap already enabled')
  }
}

type Props = {
  updateParent: Dispatch<SetStateAction<ZKProofInfo>>
  merkleRoot: string
  merkleProof: MerkleProof | null
}

export default function ProofButton({
  updateParent,
  merkleRoot,
  merkleProof,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false)
  const [zkProof, setZkProof] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const buttonText = loading ? 'Generating...' : 'Generate Proof'

  useEffect(() => {
    console.log('Updating parent')
    console.log(loading, zkProof, error)
    updateParent({ zkProof, error, loading })
  }, [loading, zkProof, error])

  async function generateProof() {
    if (loading) return
    if (!merkleRoot || !merkleProof) return
    if (!merkleProof) return
    // TODO include timeout here for proof generation
    const setup = await setupSnap()
    console.log('before set loading')
    setLoading(true)
    console.log('After set loading')
    try {
      console.log('Invoking snap method to generating the proof')
      await window.ethereum
        .request({
          method: 'wallet_invokeSnap',
          params: [
            snapId,
            {
              method: 'generateProof',
              merkleRoot: merkleRoot,
              merklePathIndices: merkleProof.merklePathIndices,
              merklePathElements: merkleProof.merklePathElements,
            },
          ],
        })
        .then((response: any) => {
          setZkProof(response)
          setError('')
        })
        .catch((err: any) => {
          alert(
            'Problem happened in snap when generating proof: ' + err.message ||
              err
          )
          setError(err.message)
        })
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
