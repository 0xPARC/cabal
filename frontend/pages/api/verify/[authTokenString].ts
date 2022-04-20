// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
// import snarkjs from 'snarkjs'
import { groth16 } from 'snarkjs'

import { PrismaClient } from '@prisma/client'
import {
  Guild,
  Role,
  User,
  ConfiguredConnection,
  AuthToken,
} from '@prisma/client/index'
import { Client, Intents } from 'discord.js'
import 'dotenv/config'

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
client.login(process.env.DISCORD_TOKEN)
const prisma = new PrismaClient()

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`)
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
}

type Error = {
  error: string
}

export type ProofSubmissionResult = {
  error: string
  proofStatus: boolean
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
    const snarkProof = req.body.proof
    const publicSignals = req.body.publicSignals
    const publicSignalMerkleRoot = publicSignals[1]
    const nullifier = publicSignals[0]

    console.log(req.body)
    console.log(req.body.proof)
    console.log(req.body.publicSignals)
    // publicSignals = [
    //   "405120837482288270193709312274786634591916908889974263035122340142620319115",
    //   "11575659063411809053808698653243228788610440614219455013616072495564231950142"
    // ]
    // first is nullfier, second is merkleRoot
    // verify merkleRoot matches merkleRoot in configuredConnection
    // verify that nullifier has not been used before?

    // const vkeyFile = fs.readFileSync('./verification_key.json')
    // const vkey = JSON.parse(vkeyFile.toString())
    const proofVerified = await groth16.verify(
      vkey,
      req.body.publicSignals,
      req.body.proof
    )
    let error = ''

    if (proofVerified) {
      console.log('proof verified')
      if (
        publicSignalMerkleRoot !== authToken.configuredConnection.merkleRoot
      ) {
        error =
          'Merkle root in public signals of proof does not match authToken merkle root.'
      }
      // Check for nullifier not being used before
      const configuredConnectionId = authToken.configuredConnectionId
      const existingNullifier = await prisma.configuredConnection.findMany({
        where: {
          id: configuredConnectionId,
        },
        select: { proofs: { where: { nullifier: nullifier } } },
      })
      console.log('existing nullifier')
      console.log(existingNullifier)
      if (existingNullifier[0].proofs.length > 0) {
        error = 'Nullifier already exists.'
      }
      if (!error) {
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
        // Only create the proof if the discord role was created
        const proof = await prisma.proof.create({
          data: {
            status: 'test_proof',
            proof: JSON.stringify(req.body),
            authTokenString: authTokenString,
            nullifier: req.body.publicSignals[0],
            configuredConnectionId: authToken.configuredConnectionId,
          },
        })
      }
    }

    const proofSubmissionResult = {
      proofStatus: proofVerified,
      error: error,
    }

    res.status(200).json(proofSubmissionResult)
    return
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
  })
}

const vkey = {
  protocol: 'groth16',
  curve: 'bn128',
  nPublic: 2,
  vk_alpha_1: [
    '20491192805390485299153009773594534940189261866228447918068658471970481763042',
    '9383485363053290200918347156157836566562967994039712273449902621266178545958',
    '1',
  ],
  vk_beta_2: [
    [
      '6375614351688725206403948262868962793625744043794305715222011528459656738731',
      '4252822878758300859123897981450591353533073413197771768651442665752259397132',
    ],
    [
      '10505242626370262277552901082094356697409835680220590971873171140371331206856',
      '21847035105528745403288232691147584728191162732299865338377159692350059136679',
    ],
    ['1', '0'],
  ],
  vk_gamma_2: [
    [
      '10857046999023057135944570762232829481370756359578518086990519993285655852781',
      '11559732032986387107991004021392285783925812861821192530917403151452391805634',
    ],
    [
      '8495653923123431417604973247489272438418190587263600148770280649306958101930',
      '4082367875863433681332203403145435568316851327593401208105741076214120093531',
    ],
    ['1', '0'],
  ],
  vk_delta_2: [
    [
      '10857046999023057135944570762232829481370756359578518086990519993285655852781',
      '11559732032986387107991004021392285783925812861821192530917403151452391805634',
    ],
    [
      '8495653923123431417604973247489272438418190587263600148770280649306958101930',
      '4082367875863433681332203403145435568316851327593401208105741076214120093531',
    ],
    ['1', '0'],
  ],
  vk_alphabeta_12: [
    [
      [
        '2029413683389138792403550203267699914886160938906632433982220835551125967885',
        '21072700047562757817161031222997517981543347628379360635925549008442030252106',
      ],
      [
        '5940354580057074848093997050200682056184807770593307860589430076672439820312',
        '12156638873931618554171829126792193045421052652279363021382169897324752428276',
      ],
      [
        '7898200236362823042373859371574133993780991612861777490112507062703164551277',
        '7074218545237549455313236346927434013100842096812539264420499035217050630853',
      ],
    ],
    [
      [
        '7077479683546002997211712695946002074877511277312570035766170199895071832130',
        '10093483419865920389913245021038182291233451549023025229112148274109565435465',
      ],
      [
        '4595479056700221319381530156280926371456704509942304414423590385166031118820',
        '19831328484489333784475432780421641293929726139240675179672856274388269393268',
      ],
      [
        '11934129596455521040620786944827826205713621633706285934057045369193958244500',
        '8037395052364110730298837004334506829870972346962140206007064471173334027475',
      ],
    ],
  ],
  IC: [
    [
      '21023519866156001314930751343014861404668256673338292161286951831053502382193',
      '18844948277297656697446309170550103608022416413222002721027707979012004996559',
      '1',
    ],
    [
      '19426330800938502762903877278847411658938479055719855975733298169525860662434',
      '17662973256927811094876084937934670699641620556064678935224386379889629676098',
      '1',
    ],
    [
      '10341748765869245869361018873948196570008407662073730870473095917462641810960',
      '14033715227242315267851452958818723384128442045773382620583348659578749522819',
      '1',
    ],
  ],
}
