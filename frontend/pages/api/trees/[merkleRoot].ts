import type { NextApiRequest, NextApiResponse } from 'next'
import { MerkleProof } from '../verify/[authTokenString]'
import fs from 'fs'
import path from 'path'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<string, MerkleProof>>
) {
  let { merkleRoot } = req.query
  const filename = `tree_${merkleRoot}.json`
  const filePath = path.resolve('./pages/api/trees', filename)
  const buffer = fs.readFileSync(filePath)
  const data = JSON.parse(buffer.toString())
  res.status(200).json(data)
}
