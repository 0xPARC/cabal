const path = require("path");
const wasm_tester = require("circom_tester").wasm;
const buildPoseidon = require("circomlibjs").buildPoseidon;

describe("poseidon equivalence", function() {
  let poseidon;
  let F;
  let circuit1;
  let circuit2;

  this.timeout(1000000);

  before(async () => {
    poseidon = await buildPoseidon();
    F = poseidon.F;
    circuit1 = await wasm_tester(path.join(__dirname, "circuits", "poseidon_1.circom"));
    circuit2 = await wasm_tester(path.join(__dirname, "circuits", "poseidon_2.circom"));
  });

  it("should work for single input poseidon", async () => {
    const inputs = ["72296106748749850946775007"]; // NOTE: taken from an actual sample case
    const res = poseidon(inputs)

    const w = await circuit1.calculateWitness({inputs: inputs}, true);

    await circuit1.assertOut(w, {out: F.toObject(res)})
    await circuit1.checkConstraints(w);
  });

  it("should work for dual input poseidon", async () => {
    const inputs = [100303028948640204807457347423488769008718577664, 1008919182143802679687711933002982315180867715072]; // NOTE: taken from an actual sample case
    const res = poseidon(inputs)

    const w = await circuit2.calculateWitness({inputs: inputs}, true);

    await circuit2.assertOut(w, {out: F.toObject(res)})
    await circuit2.checkConstraints(w);
  });
});
