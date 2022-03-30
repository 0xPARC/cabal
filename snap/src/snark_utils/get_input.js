import { ethers } from "ethers"
import { buildPoseidon } from 'circomlibjs';

import * as merkleTree from './tree.json';

// NOTE: re-use in a bunch of places
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

export const getInput = async (privateKey) => {
    const privkeyTuple = bigintToTuple(BigInt(privateKey));
    console.log(`privkeyTuple: ${privkeyTuple}`);

    const poseidon = await buildPoseidon();
    const F = poseidon.F; // poseidon finite field
    const nullifier = F.toObject(poseidon([privkeyTuple[0]]));
    console.log(`nullifier: ${nullifier}`);

    const address = ethers.utils.computeAddress(privateKey);
    const addressKey = BigInt(address).toString()
    console.log(`address: ${addressKey}`);
    console.log(typeof addressKey);

    console.log(merkleTree['leafToPathElements'][addressKey]);

    return {
        privkey: privkeyTuple.map(p => p.toString()),
        nullifier: BigInt(nullifier).toString(),

        merkleRoot: merkleTree['root'],

        merklePathElements: merkleTree['leafToPathElements'][addressKey],
        merklePathIndices: merkleTree['leafToPathIndices'][addressKey]
    }
}
