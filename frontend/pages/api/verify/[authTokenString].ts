// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient } from '@prisma/client'
import {
  Guild,
  Role,
  User,
  ConfiguredConnection,
  AuthToken,
} from '@prisma/client/index'

const prisma = new PrismaClient()

export type Data = {
  configuredConnection: ConfiguredConnection
  guild: Guild
  role: Role
  user: User
}

type Error = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) {
  let { authTokenString } = req.query
  if (typeof authTokenString == 'object') {
    res.status(400).json({ error: 'provided auth token is weird' })
    return
  }
  authTokenString = authTokenString as string
  const authToken = await prisma.authToken.findUnique({
    where: { authTokenString: authTokenString },
    include: { configuredConnection: true, user: true },
  })
  if (!authToken) {
    res.status(404).json({ error: 'auth token not found' })
    return
  }
  // TODO check for authToken timeout here
  const configuredConnection = authToken.configuredConnection
  const guild = await prisma.guild.findUnique({
    where: { guildId: configuredConnection.guildId },
  })
  const role = await prisma.role.findUnique({
    where: { roleId: configuredConnection.roleId },
  })
  if (!role || !guild) {
    res.status(404).json({ error: 'role or guild is not found' })
    return
  }
  res.status(200).json({
    configuredConnection: authToken.configuredConnection,
    role: role,
    guild: guild,
    user: authToken.user,
  })
}
