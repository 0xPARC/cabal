// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

// import snarkjs from 'snarkjs'
import { groth16 } from 'snarkjs'
import builder from './witness_calculator'
import fs from 'fs'
import path from 'path'

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

type Data = {
  proof: string
}

const wasmPath =
  'https://cabal.sfo3.digitaloceanspaces.com/VerifySigCabal_64-4-10_prod.wasm'
const zkeyPath =
  'https://cabal.sfo3.digitaloceanspaces.com/VerifySigCabal_64-4-10_prod.zkey'
export const generateProof = async (input) => {
  const wtnsBuff = await generateWitness(input)
  console.log('generated witness')
  console.log('Downloading zkey')
  const zkeyResp = await fetch(zkeyPath)
  const zkeyBuff = await zkeyResp.arrayBuffer()
  console.log('got zkey buff')
  const { proof, publicSignals } = await groth16.prove(
    new Uint8Array(zkeyBuff),
    wtnsBuff,
    null
  )
  return { proof, publicSignals }
}

export const generateWitness = async (input) => {
  console.log('starting wasm download')
  const wasmResp = await fetch(wasmPath)
  const wasmBuff = await wasmResp.arrayBuffer()
  const witnessCalculator = await builder(wasmBuff)
  console.log('Loaded witness calculator')
  const wtnsBuff = await witnessCalculator.calculateWTNSBin(input, 0)
  return wtnsBuff
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('HI')
  //   const wasmPath = 'VerifySigCabal_64-4-10_prod.wasm'
  //   const zkeyPath = 'VerifySigCabal_64-4-10_prod.zkey'
  //   const zkeyResp = await fetch(zkeyPath)

  if (req.method === 'POST') {
    let parsedInput = req.body
    if (typeof req.body === 'string') {
      parsedInput = JSON.parse(parsedInput)
    }
    console.log(parsedInput)
    // This is the inputs to the snark
    const proof = await generateProof(parsedInput)
    // const proof = await groth16.fullProve(parsedInput, wasmPath, zkeyPath)
    res.status(200).json({
      proof: JSON.stringify(proof),
    })
  }
}
