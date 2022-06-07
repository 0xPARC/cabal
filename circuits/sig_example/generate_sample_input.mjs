import { ethers } from "ethers";
import { buildTree } from "../rootgen/src/merkle.mjs";
import { bigintToTuple, pubkeyStrToXY } from "./test/utils.js";

// import { bigintToTuple, pubkeyStrToXY } from "./test/utils.js";
import fs from "fs";

// TOOD make this an export of `test/verify_cabal_sig.mjs`

function pubKeyToBigIntChunks(pubkey) {
  // takes in a string (hex) pubkey and converts to bigint chunks
  // ready for circuit consumption
  let [x, y] = pubkeyStrToXY(pubkey);
  return [bigintToTuple(x), bigintToTuple(y)];
}

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

const sampleInput = {
  r: rTuple,
  s: sTuple,
  msghash: chunkedHash,
  pubkey: pubkeyChunked,
  merkleRoot: root,
  merklePathElements,
  merklePathIndices,
};

console.log(sampleInput);
BigInt.prototype.toJSON = function () {
  return this.toString();
};
fs.writeFile("sig_sample_input.json", JSON.stringify(sampleInput), (err) => {
  console.log(err);
});
