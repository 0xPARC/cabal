pragma circom 2.0.1;

include "./merkle.circom";
include "./eth.circom";

include "../circom-ecdsa/circuits/ecdsa.circom";
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
  signal input merkleRoot; // of eth addresses

  // NOTE: chunked into k n-bit registers for easy use by ECDSAVerify
  signal chunkedPubkey[2][k];
  signal pubkeyBits[512];
  signal address; // for now, num, but could be bit array too

  // pubkey = ECDSAPrivToPub(privkey) 
  component privToPub = ECDSAPrivToPub(n, k);
  for (var i = 0; i < k; i++) {
    privToPub.privkey[i] <== privkey[i];

    chunkedPubkey[0][i] <== privToPub.pubkey[0][i];
    chunkedPubkey[1][i] <== privToPub.pubkey[1][i];
  }

  // address = keccak(flatten(pubkey))
  component flattenPubkey = FlattenPubkey(n, k);
  for (var i = 0; i < k; i++) {
    flattenPubkey.chunkedPubkey[0][i] <== chunkedPubkey[0][i];
    flattenPubkey.chunkedPubkey[1][i] <== chunkedPubkey[1][i];
  }
  for (var i = 0; i < 512; i++) {
    pubkeyBits[i] <== flattenPubkey.pubkeyBits[i];
  }
  component pubkeyToAddress = PubkeyToAddress();
  for (var i = 0; i < 512; i++) {
    pubkeyToAddress.pubkeyBits[i] <== pubkeyBits[i];
  }
  address <== pubkeyToAddress.address;

  // merkle verify
  component treeChecker = MerkleTreeChecker(levels);
  treeChecker.leaf <== address;
  treeChecker.root <== merkleRoot;
  for (var i = 0; i < levels; i++) {
    treeChecker.pathElements[i] <== merklePathElements[i];
    treeChecker.pathIndices[i] <== merklePathIndices[i];
  }

  // nullifier check
  component nullifierCheck = Poseidon(1);
  nullifierCheck.inputs[0] <== privkey[0]; // first register of privkey should be sufficient 
  nullifierCheck.out === nullifier;
}