// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import snarkjs from 'snarkjs'
import { PrismaClient } from '@prisma/client'
import {
  Guild,
  Role,
  User,
  ConfiguredConnection,
  AuthToken,
} from '@prisma/client/index'
import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Client,
  Intents,
  Message,
  IntegrationApplication,
} from 'discord.js'
import 'dotenv/config'
import fs from 'fs'

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
client.login(process.env.DISCORD_TOKEN)
const prisma = new PrismaClient()

let clientReady = false
client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`)
  clientReady = true
})

export type MerkleProof = {
  merklePathIndices: number[]
  merklePathElements: string[]
}

export type Data = {
  configuredConnection: ConfiguredConnection
  guild: Guild
  role: Role
  user: User
  merkleProofsByAddr: Record<string, MerkleProof>
}

type Error = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error | string>
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

  // This is for POST (i.e. uploading proof for authToken)
  if (req.method === 'POST') {
    console.log(req.body) // This is JSON
    const proof = await prisma.proof.create({
      data: {
        status: 'test_proof',
        proof: JSON.stringify(req.body),
        authTokenString: authTokenString,
      },
    })

    const vkeyFile = fs.readFileSync('./verification_key.json')
    const vkey = JSON.parse(vkeyFile.toString())
    const proofVerified = await snarkjs.groth16.verify(
      vkey,
      req.body.publicSignals,
      req.body.proof
    )

    if (proofVerified) {
      // discord add role
      const guildId = authToken.configuredConnection.guildId
      const guild = await client.guilds.fetch(guildId)
      if (!guild) {
        return
      }
      const userId = authToken.user.userId
      const member = await guild.members.fetch(userId)
      if (!member) {
        return
      }
      const roleId = authToken.configuredConnection.roleId
      await member.roles.add([roleId])
      res.status(200).send('Valid proof!')
      return
    } else {
      res.status(200).send('Invalid proof!')
    }
  }

  // This is for GET
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
    merkleProofsByAddr: {
      '0x3Af621b0a91F667B38A652Aff8B5d5c9855dD737': {
        merklePathElements: [
          '0x35f3d53b4fe1cbE59810687BB2b0795778d8605F',
          '0x123d53b4fe1cbE59810687BB2b0795778d8605F',
        ],
        merklePathIndices: [0, 1, 0],
      },
    },
  })
}
