import type { NextApiRequest, NextApiResponse } from 'next'
import zod from 'zod'
import db from '../../../../lib/db'
import { ClubResource } from '../../../../lib/db/types'

const Schema = zod.object({
  adminId: zod.string(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClubResource>
) {
  if (req.method === 'POST') {
    const { adminId } = Schema.parse(req.body)
    const result = await db.computeMerkleRoot(
      { adminId },
      {
        computeRoot(commitments) {
          return ''
        },
      }
    )
    return res
      .status('type' in result && result.type === 'success' ? 200 : 400)
      .json(result)
  }
  res.status(404).end()
}
