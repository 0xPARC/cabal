pragma circom 2.0.1;

include "./merkle.circom";
include "./eth.circom";

include "../circom-ecdsa/circuits/zk-identity/eth.circom";
include "../circom-ecdsa/circuits/vocdoni-keccak/keccak.circom";

include "../circom-ecdsa/node_modules/circomlib/circuits/poseidon.circom";
include "../circom-ecdsa/node_modules/circomlib/circuits/bitify.circom";


/*
 * Prove: I know (r, s, pubkey, msghash, merkleBranch, merkleRoot) s.t.
 * - verify pubkey is valid
 * - address == ECDSAVerifyNoPubkeyCheckToAddress(r, s, msghash, pubkey)
 * - merkle_verify(address, merkleRoot, merklePathElements, merklePathIndices)
 * - TODO: add signature_hash = hash(r,s,msg_hash) as output
 *
 * We may choose to make all of these constants in the future:
 * levels = levels in the merkle branch
 * n = num bits for bigint number registers
 * k = num registers for bigint numbers
 */
template VerifySigCabal(n, k, levels) {
  signal input r[k];
  signal input s[k];
  signal input msghash[k];
  signal input pubkey[2][k];

  signal input merklePathElements[levels];
  signal input merklePathIndices[levels];
  signal input merkleRoot; // of eth addresses

  // There is no output signal
  signal address;

  // priv to address
  component ecdsaVerifyToAddress = ECDSAVerifyNoPubkeyCheckToAddress(n, k);
  for (var i = 0; i < k; i++) {
    ecdsaVerifyToAddress.r[i] <== r[i];
    ecdsaVerifyToAddress.s[i] <== s[i];
    ecdsaVerifyToAddress.msghash[i] <== msghash[i];
    ecdsaVerifyToAddress.pubkey[0][i] <== pubkey[0][i];
    ecdsaVerifyToAddress.pubkey[1][i] <== pubkey[1][i];
  }
  address <== ecdsaVerifyToAddress.address;
  log(address);

  // merkle verify of address
  component treeChecker = MerkleTreeChecker(levels);
  treeChecker.leaf <== address;
  treeChecker.root <== merkleRoot;
  for (var i = 0; i < levels; i++) {
    treeChecker.pathElements[i] <== merklePathElements[i];
    treeChecker.pathIndices[i] <== merklePathIndices[i];
  }

  // TODO add a signature hash here, if necesary
}
