// this is adapted from https://github.com/Derked/FantasyCampaign/blob/main/src/utils/snarkUtils.ts

import { groth16 } from 'snarkjs';
import builder from './witness_calculator';

const zkeyPath = "http://localhost:3000/verify_cabal_final.zkey"
const wasmPath = "http://localhost:3000/verify_cabal.wasm"

export const generateWitness = async (input) => {
    console.log('At top of witness generation.')
    const sampleInput = {
        "privkey": [
          "3337750098259318625",
          "8821854746021967734",
          "14763898429413747298",
          "14106694145162703524"
        ],
        "nullifier": "2534043996169215677091121991548563065064944085977132743134611389386011965637",
        "merkleRoot": "4599433203808194985568354012309198395634034548055089906548395627496881193130",
        "merklePathElements": [
          "448252437897058252930414510071318431130073900301",
          "8478304616127837477251100404014650412120332943405331563168493916134649106324",
          "11947256232420878242236238820921747427440343417051115410704903049724291903884",
          "3087963869837292524027820415203253383352578206377063859438517787926736872090",
          "10511967430273825850669463402508806439229665831145372853326098397535884439685",
          "868227038006217426073823056827096090829717711219495906192776865198201881326",
          "21601170239350882727048046078678090054765815687493712280849519719949212724606",
          "6780578572926211828918843234268155468738170775586615095204805427597045143296",
          "9614412938679252889759663324019265913911941818238110514371930174100018084059",
          "3672123210314631796086215546541299386001154027477140848215731158708032014787"
        ],
        "merklePathIndices": [
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
      
    const wasmResp = await fetch(wasmPath);
    const wasmBuff = await wasmResp.arrayBuffer();
    const mod = await builder(wasmBuff);
    const wtnsBuff = await mod.calculateWTNSBin(sampleInput, 0);
    console.log("witness generated");
    console.log(wtnsBuff);
    return wtnsBuff;
}

export const generateProof = async (wtnsBuff) => {
    console.log('At top of proof generation.')

    // const zkeyResp = await fetch(zkeyPath);
    // console.log("fetched zkey");
    // const zkeyBuff = await zkeyResp.arrayBuffer();
    // console.log("start calling groth16 prove");
    // const { proof, publicSignals } = await groth16.prove(
    //     new Uint8Array(zkeyBuff),
    //     wtnsBuff,
    //     null
    // );
    // console.log(proof);
    // console.log(publicSignals);
    // return { proof, publicSignals };
}
