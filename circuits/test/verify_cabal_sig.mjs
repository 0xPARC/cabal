import path from "path";
import { ethers } from "ethers";

import circom_tester from "circom_tester";
import { buildTree } from "../../rootgen/src/merkle.mjs";
import { bigintToTuple, pubkeyStrToXY } from "./utils.js";
const wasm_tester = circom_tester.wasm;

import { buildPoseidon } from "circomlibjs";

// NOTE: necessary for __dirname hack in es module
import { dirname } from "path";
import { fileURLToPath } from "url";

function pubKeyToBigIntChunks(pubkey) {
  // takes in a string (hex) pubkey and converts to bigint chunks
  // ready for circuit consumption
  let [x, y] = pubkeyStrToXY(pubkey);
  return [bigintToTuple(x), bigintToTuple(y)];
}

describe("verify cabal sig e2e", function () {
  this.timeout(1000 * 1000);

  it("handle sample_input.json", async () => {
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;
    const pubKey = wallet.publicKey;
    const flatSig = await wallet.signMessage("Hello World");
    let sig = ethers.utils.splitSignature(flatSig);
    console.log("address", address);
    console.log("pubkey", pubKey);
    console.log("sig", sig);
    const rTuple = bigintToTuple(BigInt(sig.r));
    const sTuple = bigintToTuple(BigInt(sig.s));
    const { root, leafToPathElements, leafToPathIndices } = await buildTree([address]);
    const bigIntAddress = BigInt(address);
    const merklePathIndices = leafToPathIndices[bigIntAddress]; // todo convert to number
    const merklePathElements = leafToPathElements[bigIntAddress]; // todo convert to number
    console.log(merklePathElements);
    console.log(merklePathIndices);

    const pubkeyChunked = pubKeyToBigIntChunks(pubKey);

    const hashMessage = ethers.utils.hashMessage("Hello World");
    const chunkedHash = bigintToTuple(BigInt(hashMessage));

    const __dirname = dirname(fileURLToPath(import.meta.url));
    console.log("awaiting wasm tester");
    let circuit = await wasm_tester(
      path.join(__dirname, "circuits", "verify_sig_cabal_64_4_10.circom")
    );

    // // TODO: read from the relevant place
    const sampleInput = {
      r: rTuple,
      s: sTuple,
      msghash: chunkedHash,
      pubkey: pubkeyChunked,
      merkleRoot: root,
      merklePathElements,
      merklePathIndices,
    };

    console.log("generating witness");
    const w = await circuit.calculateWitness(sampleInput, true);
    console.log(w);
    await circuit.checkConstraints(w);
  });
});
