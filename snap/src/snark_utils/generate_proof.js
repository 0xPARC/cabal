// this is adapted from https://github.com/Derked/FantasyCampaign/blob/main/src/utils/snarkUtils.ts

import { groth16 } from 'snarkjs'
import builder from './witness_calculator'

const zkeyPath = "./VerifyCabal_86-3-10_prod.0.zkey"
const wasmPath = "./VerifyCabal_86-3-10_prod.wasm"

export const generateProof = async (input) => {
    const zkeyResp = await fetch(zkeyPath);
    const zkeyBuff = await zkeyResp.arrayBuffer();

    const wtnsBuff = await generateWitness(input);

    const { proof, publicSignals } = await groth16.prove(
        new Uint8Array(zkeyBuff),
        wtnsBuff,
        null
    );
    return { proof, publicSignals };
}

export const generateWitness = async (input) => {
    const wasmResp = await fetch(wasmPath);
    const wasmBuff = await wasmResp.arrayBuffer();
  
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
