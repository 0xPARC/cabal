const fs = require('fs');

const wasmFilePath = './zkeys/VerifyCabal_64-4-10_prod_js/VerifyCabal_64-4-10_prod.wasm';
const zkeyFilePath = './zkeys/VerifyCabal_64-4-10_prod.0.zkey';

const wasmBytes = fs.readFileSync(wasmFilePath).buffer;
const wasmUint8Array = new Uint8Array(wasmBytes);

const zkeyBytes = fs.readFileSync(zkeyFilePath).buffer;
const zkeyUint8Array = new Uint8Array(zkeyBytes);

console.log(`writing wasm json... ${wasmUint8Array.length} length array`);

const wasmJson = JSON.stringify(
  {
    uintArray: Array.from(wasmUint8Array)
  });
fs.writeFileSync('../snap/src/snark_utils/wasm.json', wasmJson);

// NOTE: prohibitively expensive
console.log(`writing zkey json... ${zkeyUint8Array.length} length array`);

const zkeyJson = JSON.stringify(
  {
    uintArray: Array.from(zkeyUint8Array)
  });
fs.writeFileSync('../snap/src/snark_utils/zkey.json', zkeyJson);
