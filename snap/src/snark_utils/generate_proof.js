// this is adapted from https://github.com/Derked/FantasyCampaign/blob/main/src/utils/snarkUtils.ts

import { groth16 } from "snarkjs";
import builder from "./witness_calculator";

// const zkeyPath = "http://localhost:3000/VerifyCabal_64-4-10_prod.0.zkey";
// const wasmPath = "http://localhost:3000/VerifyCabal_64-4-10_prod.wasm";
// const zkeyPath = "https://cabal.xyz/verify_cabal_final.zkey";
// const wasmPath = "https://cabal.xyz/verify_cabal.wasm";
const zkeyPath = "https://cabal.sfo3.digitaloceanspaces.com/verify_cabal_final.zkey";
const wasmPath = "https://cabal.sfo3.digitaloceanspaces.com/verify_cabal.wasm";

export const generateProof = async (input) => {
  const wtnsBuff = await generateWitness(input);

  const zkeyResp = await fetch(zkeyPath);
  const zkeyBuff = await zkeyResp.arrayBuffer();

  const { proof, publicSignals } = await groth16.prove(new Uint8Array(zkeyBuff), wtnsBuff, null);
  return { proof, publicSignals };
};

export const generateWitness = async (input) => {
  const wasmResp = await fetch(wasmPath);
  const wasmBuff = await wasmResp.arrayBuffer();
  const witnessCalculator = await builder(wasmBuff);
  const wtnsBuff = await witnessCalculator.calculateWTNSBin(input, 0);
  return wtnsBuff;
};
