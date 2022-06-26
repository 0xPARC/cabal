import type { NextApiRequest, NextApiResponse } from 'next'
import zod from 'zod'
import db from '../../../lib/db'
import { ClubResource } from '../../../lib/db/types'

const Schema = zod.object({
  commitment: zod.string(),
  signature: zod.string(),
  address: zod.string(),
  clubId: zod.string(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClubResource>
) {
  if (req.method === 'POST') {
    const { commitment, address, signature, clubId } = Schema.parse(req.body)
    const result = await db.addPublicCommitment(clubId, {
      commitment,
      signature,
      address,
      verifySignature: () => true,
    })

    return res
      .status('type' in result && result.type === 'success' ? 200 : 400)
      .json(result)
  }
  res.status(404).end()
}
