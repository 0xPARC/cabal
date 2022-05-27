pragma circom 2.0.1;

include "../circom-ecdsa/circuits/ecdsa.circom";

include "../circom-ecdsa/circuits/zk-identity/eth.circom";

// NOTE: perhaps should be pushed into circom-ecdsa/circuits/zk-identity/eth.circom
template ChunkedPubkeyToAddress(n, k) {
  signal input chunkedPubkey[2][k];
  signal output address;

  signal pubkeyBits[512];

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
}

template ECDSAPrivToAddress(n, k) {
  signal input privkey[k];

  signal output address;

  signal chunkedPubkey[2][k];
  signal pubkeyBits[512];

  // pubkey = ECDSAPrivToPub(privkey)
  component privToPub = ECDSAPrivToPub(n, k);
  for (var i = 0; i < k; i++) {
    privToPub.privkey[i] <== privkey[i];
  }
  for (var i = 0; i < k; i++) {
    chunkedPubkey[0][i] <== privToPub.pubkey[0][i];
    chunkedPubkey[1][i] <== privToPub.pubkey[1][i];
  }

  // address = keccak(flatten(pubkey))
  component pkToAddress = ChunkedPubkeyToAddress(n, k);
  for (var i = 0; i < k; i++) {
    pkToAddress.chunkedPubkey[0][i] <== chunkedPubkey[0][i];
    pkToAddress.chunkedPubkey[1][i] <== chunkedPubkey[1][i];
  }
  address <== pkToAddress.address;
}

template ECDSAVerifyNoPubkeyCheckToAddress(n,k) {
  signal input r[k];
  signal input s[k];
  signal input msghash[k];
  signal input pubkey[2][k];

  signal output address;

  component ecdsaVerify = ECDSAVerifyNoPubkeyCheck(n,k);
  for (var i=0; i < k; i++) {
    ecdsaVerify.r[i] <== r[i];
    ecdsaVerify.s[i] <== s[i];
    ecdsaVerify.msghash[i] <== msghash[i];
    ecdsaVerify.pubkey[0][i] <== pubkey[0][i];
    ecdsaVerify.pubkey[1][i] <== pubkey[1][i];
  }

  // Assert that the result of ECDSA verify is true
  log(ecdsaVerify.result);
  ecdsaVerify.result === 1;

  // now compute address, copied from above
  component pkToAddress = ChunkedPubkeyToAddress(n, k);
  for (var i = 0; i < k; i++) {
    pkToAddress.chunkedPubkey[0][i] <== pubkey[0][i];
    pkToAddress.chunkedPubkey[1][i] <== pubkey[1][i];
  }
  address <== pkToAddress.address;
}