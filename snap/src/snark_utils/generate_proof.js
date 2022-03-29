// this is adapted from https://github.com/Derked/FantasyCampaign/blob/main/src/utils/snarkUtils.ts

import { groth16 } from 'snarkjs'
import builder from './witness_calculator'

import * as wasmJson from './wasm.json';

const zkeyPath = "./zkey.json"

export const generateProof = async (input) => {
    // TODO: change into static
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
    const wasmArr = wasmJson['uintArray'];
    return new Promise((resolve, reject) => {
        builder(Uint8Array.from(wasmArr).buffer)
        .then(async witnessCalculator => {
            const buff = await witnessCalculator.calculateWTNSBin(input, 0);
            resolve(buff);
        })
        .catch(error => {
            reject(error);
        });
    });
};
