/*
 * Prove: I know (sig, msg, pubkey, nullifier, nullifierHash, merkle_branch, merkle_root) s.t.:
 * - sig == ecdsa_verify(r, s, msghash, pubkey)
 * - merkle_verify(pubkey, merkleRoot, merklePathElements, merklePathIndices)
 * - nullifier = poseidon(sig)
 *
 * We may choose to make all of these constants in the future:
 * levels = levels in the merkle branch
 * n = num bits for bigint number registers
 * k = num registers for bigint numbers
 */