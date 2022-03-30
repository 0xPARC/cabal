import { buildPoseidon } from "circomlibjs";
import { deriveBIP44AddressKey } from "@metamask/key-tree";

import { generateProof } from "./snark_utils/generate_proof";

// NOTE: re-use in a bunch of places
// for converting privkey to 4-tuple
function bigintToTuple(x) {
  // 2 ** 64
  let mod = 18446744073709551616n;
  let ret = [0n, 0n, 0n, 0n];

  var x_temp = x;
  for (var idx = 0; idx < 4; idx++) {
    ret[idx] = x_temp % mod;
    x_temp = x_temp / mod;
  }
  return ret;
}

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  switch (requestObject.method) {
    case "generateProof":
      const ethNode = await wallet.request({
        method: "snap_getBip44Entropy_60",
      });

      const extendedPrivateKey = deriveBIP44AddressKey(ethNode, {
        account: 0,
        address_index: requestObject.account || 0,
        change: 0,
      });
      const privateKey = extendedPrivateKey.slice(0, 32);
      const privateKeyHex = "0x" + Buffer.from(privateKey).toString("hex");
      const privkeyTuple = bigintToTuple(BigInt(privateKeyHex));
      console.log(`privkeyTuple: ${privkeyTuple}`);

      const poseidon = await buildPoseidon();
      const F = poseidon.F; // poseidon finite field
      const nullifier = F.toObject(poseidon([privkeyTuple[0]]));
      console.log(`nullifier: ${nullifier}`);

      const input = {
        privkey: privkeyTuple,
        nullifier: nullifier,

        merkleRoot: requestObject.merkleRoot,
        merklePathElements: requestObject.merklePathElements,
        merklePathIndices: requestObject.merklePathIndices,
      };
      const proof = await generateProof(input);

      return proof;
    default:
      throw new Error("Method not found.");
  }
});
