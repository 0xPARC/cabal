pragma circom 2.0.1;

include "./merkle.circom";
include "./eth.circom";

include "../circom-ecdsa/circuits/zk-identity/eth.circom";
include "../circom-ecdsa/circuits/vocdoni-keccak/keccak.circom";

include "../circom-ecdsa/node_modules/circomlib/circuits/poseidon.circom";
include "../circom-ecdsa/node_modules/circomlib/circuits/bitify.circom";


/*
 * Prove: I know (privkey, nullifier, merkleBranch, merkleRoot) s.t.
 * - address == pubkey_to_address(priv_to_pub(privkey))
 * - merkle_verify(address, merkleRoot, merklePathElements, merklePathIndices)
 * - nullifier = poseidon(privkey)
 *
 * We may choose to make all of these constants in the future:
 * levels = levels in the merkle branch
 * n = num bits for bigint number registers
 * k = num registers for bigint numbers
 */
template VerifyCabal(n, k, levels) {
  signal input privkey[k];

  signal input nullifier;

  signal input merklePathElements[levels];
  signal input merklePathIndices[levels];

  signal output merkleRoot; // of eth addresses

  // NOTE: chunked into k n-bit registers for easy use by ECDSAPrivToPub
  signal chunkedPubkey[2][k];
  signal pubkeyBits[512];
  signal address;

  // priv to address
  component privToAddress = ECDSAPrivToAddress(n, k);
  for (var i = 0; i < k; i++) {
    privToAddress.privkey[i] <== privkey[i];
  }
  address <== privToAddress.address;

  // merkle verify of address
  component treeChecker = MerkleTreeChecker(levels);
  treeChecker.leaf <== address;
  for (var i = 0; i < levels; i++) {
    treeChecker.pathElements[i] <== merklePathElements[i];
    treeChecker.pathIndices[i] <== merklePathIndices[i];
  }
  merkleRoot <== treeChecker.root;

  // nullifier check
  component nullifierCheck = Poseidon(1);
  nullifierCheck.inputs[0] <== privkey[0]; // first register of privkey should be sufficient
  nullifierCheck.out === nullifier;
}
