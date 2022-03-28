import { ethers } from 'ethers'

import { buildPoseidon } from 'circomlibjs';

//const poseidon = await buildPoseidon();
//const F = poseidon.F; // poseidon finite field

// NOTE: re-use with circuits/test/eth.js + rootgen
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

const sampleInput = {
    privkey: [
        3337750098259318625n,
        8821854746021967734n,
        14763898429413747298n,
        14106694145162703524n
    ],
    nullifier: 2534043996169215677091121991548563065064944085977132743134611389386011965637n,
    merkleRoot: 4599433203808194985568354012309198395634034548055089906548395627496881193130n,
    merklePathElements: [
        448252437897058252930414510071318431130073900301n,
        8478304616127837477251100404014650412120332943405331563168493916134649106324n,
        11947256232420878242236238820921747427440343417051115410704903049724291903884n,
        3087963869837292524027820415203253383352578206377063859438517787926736872090n,
        10511967430273825850669463402508806439229665831145372853326098397535884439685n,
        868227038006217426073823056827096090829717711219495906192776865198201881326n,
        21601170239350882727048046078678090054765815687493712280849519719949212724606n,
        6780578572926211828918843234268155468738170775586615095204805427597045143296n,
        9614412938679252889759663324019265913911941818238110514371930174100018084059n,
        3672123210314631796086215546541299386001154027477140848215731158708032014787n
    ],
    merklePathIndices: [
        1,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        0,
        1
    ]
};

export const getInput = async (privateKey) => {
    // TODO: get real merkleRoot, merklePathElements, and merklePathIndices
    // privkey->address requires ethers
    // address->merkle stuff requires tree.json

    // TODO: actually compute pkTuple + nullifier
    //const nullifier = F.toObject(poseidon([pkTuple[0]]));

    const merkleRoot = 1234;
    const marklePathElements = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
    const merklePathIndices = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];

    // NOTE: temp
    return sampleInput;
}
