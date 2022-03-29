const fs = require('fs');

const wasmBytes = fs.readFileSync('./zkeys/VerifyCabal_64-4-10_prod.wasm').buffer;
const wasmUint8Array = new Uint8Array(wasmBytes);

const zkeyBytes = fs.readFileSync('./zkeys/VerifyCabal_64-4-10_prod.0.zkey').buffer;
const zkeyUint8Array = new Uint8Array(zkeyBytes);

console.log(`writing wasm json... ${wasmUint8Array.length} length array`);

const wasmJson = JSON.stringify(
  {
    uintArray: Array.from(wasmUint8Array)
  });
fs.writeFileSync('src/snark_utils/wasm.json', wasmJson);

// NOTE: prohibitively expensive
console.log(`writing zkey json... ${zkeyUint8Array.length} length array`);

const zkeyJson = JSON.stringify(zkeyUint8Array);
fs.writeFileSync('src/snark_utils/zkey.json', zkeyJson);
