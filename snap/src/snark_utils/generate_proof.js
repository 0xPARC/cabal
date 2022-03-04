// this is adapted from https://github.com/Derked/FantasyCampaign/blob/main/src/utils/snarkUtils.ts

import { groth16 } from 'snarkjs'
import builder from './witness_calculator'

export const generateProof = async (input, wasmUrl, zkeyUrl) => {
    const zkeyResp = await fetch(zkeyUrl)
    const zkeyBuff = await zkeyResp.arrayBuffer()

    const wtnsBuff = await generateWitness(input, wasmUrl);

    const { proof, publicSignals } = await groth16.prove(
        new Uint8Array(zkeyBuff),
        wtnsBuff,
        null
    );
    return { proof, publicSignals };
}

export const generateWitness = async (input, wasmUrl) => {
    const wasmResp = await fetch(wasmUrl)
    const wasmBuff = await wasmResp.arrayBuffer()
  
  return new Promise((resolve, reject) => {
    builder(wasmBuff)
    .then(async witnessCalculator => {
        const buff = await witnessCalculator.calculateWTNSBin(input, 0);
        resolve(buff);
    })
    .catch(error => {
        reject(error);
    });
  });
};  
