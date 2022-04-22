import { useState, useEffect } from 'react'

import {
  Data,
  MerkleProof,
  ProofSubmissionResult,
} from '../pages/api/verify/[authTokenString]'

type QueryParam = string | string[] | undefined

export function validateQueryParams(
  merkleRoot: QueryParam,
  userId: QueryParam,
  serverId: QueryParam
) {
  if (
    merkleRoot !== undefined &&
    userId !== undefined &&
    serverId !== undefined
  ) {
    // add more validation based on what we need
    return true
  } else {
    return false
  }
}

export function useMerkleProof(
  authTokenData: Data | null,
  metamaskAddress: string | null
) {
  const [merkleProof, setMerkleProof] = useState<MerkleProof | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!metamaskAddress) return
    if (!authTokenData) return
    const merkleRoot = authTokenData.configuredConnection.merkleRoot
    const addressAsInt = BigInt(metamaskAddress).toString()
    const getProof = async () => {
      setLoading(true)

      fetch(`/api/trees/${merkleRoot}`)
        .then((res) => res.json())
        .then((merkleProofData) => {
          console.log('merkle proof', merkleProofData)
          if (!merkleProofData.leafToPathElements[addressAsInt]) {
            setError('Address not in merkle root!')
          } else {
            const myProof = {
              merklePathElements:
                merkleProofData.leafToPathElements[addressAsInt],
              merklePathIndices:
                merkleProofData.leafToPathIndices[addressAsInt],
            }
            setMerkleProof(myProof)
          }
        })
        .catch(() => {
          setError(
            'Merkle root not found in backend. The discord server admin probably configured a merkle root we do not support.'
          )
        })
      setLoading(false)
    }
    getProof()
  }, [authTokenData, metamaskAddress])

  return { merkleProof, loading, error }
}

