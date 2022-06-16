import type { NextApiRequest, NextApiResponse } from 'next'
import zod from 'zod'
import db from '../../../../lib/db'
import { ClubResource, ClubResourceCode } from '../../../../lib/db/types'

const Schema = zod.object({
  addresses: zod.array(zod.string()),
  adminId: zod.string(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>
) {
  const { addresses, adminId } = Schema.parse(req.body)
  let result: ClubResource<any, any> | null = null
  if (req.method === 'POST') {
    result = await db.addAddresses({ addresses, adminId })
  } else if (req.method === 'DELETE') {
    result = await db.removeAddresses({ addresses, adminId })
  }

  if (result !== null) {
    return res
      .status(result.type === ClubResourceCode.SUCCESS ? 200 : 400)
      .json(result)
  }
  res.status(404).end()
}
