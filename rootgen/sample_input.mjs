import { readFileSync, writeFileSync } from 'fs';

import { buildPoseidon } from 'circomlibjs';
import { ethers } from "ethers";

const poseidon = await buildPoseidon();
const F = poseidon.F; // poseidon finite field

// NOTE: re-use with circuits/test/eth.js
// for converting privkey to 4-tuple
function bigintToTuple(x) {
  // 2 ** 64
  let mod = 18446744073709551616n
  let ret = [0n, 0n, 0n, 0n];

  var x_temp = x;
  for (var idx = 0; idx < 4; idx++) {
    ret[idx] = x_temp % mod;
    x_temp = x_temp / mod;
  }
  return ret;
}

// NOTE: the first tester privkey also used in circom-ecdsa tests
const privkey = '0xc3c50b95a58172a4cce3e76629276a627a6d8626bcbbb7762e521207bbc59761';
const pkTuple = bigintToTuple(BigInt(privkey));

const nullifier = F.toObject(poseidon([pkTuple[0]]));

const tree = JSON.parse(readFileSync('output/tree.json'));

const address = ethers.utils.computeAddress(privkey);
const root = tree['root'];
const pathElements = tree['leafToPathElements'][BigInt(address)];
const pathIndices = tree['leafToPathIndices'][BigInt(address)];

writeFileSync('output/sample_input.json', JSON.stringify(
  {
    "privkey": BigInt(privkey),
    "nullifier": nullifier,
    "merkleRoot": root,
    "merklePathElements": pathElements,
    "merklePathIndices": pathIndices
  },
  (k, v) =>  typeof v == 'bigint' ? v.toString() : v,
  2
))
