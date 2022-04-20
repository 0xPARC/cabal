import type { NextApiRequest, NextApiResponse } from 'next'
import { MerkleProof } from '../verify/[authTokenString]'
import fs from 'fs'
import path from 'path'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<string, MerkleProof> | { error: string }>
) {
  let { merkleRoot } = req.query
  const filename = `tree_${merkleRoot}.json`
  const filePath = path.resolve('./pages/api/trees', filename)
  const buffer = fs.readFileSync(filePath)
  const data = JSON.parse(buffer.toString())
  res.status(200).json(data)

  if (req.method === 'POST') {
    // If you're creating a tree, then we save the tree data
    const wholeTree = req.body
    const merkleRoot = wholeTree.root
    const leafToPathElement = wholeTree.leafToPathElements
    const leafToPathIndices = wholeTree.leafToPathIndices
    if (!merkleRoot || !leafToPathElement || !leafToPathIndices) {
      res.status(404).json({ error: 'Incorrectly formatted data' })
      return
    }

    const filename = `tree_${merkleRoot}.json`
    const filePath = path.resolve('./pages/api/trees', filename)
    fs.writeFileSync(filePath, JSON.stringify(wholeTree), { flag: 'w+' })
    res.status(200)
    return
  }
}
