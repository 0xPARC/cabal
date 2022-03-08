const path = require("path");

const chai = require("chai");
const circom_tester = require("circom_tester");

const utils = require("./utils");

const assert = chai.assert;
const wasm_tester = circom_tester.wasm;

describe("verify cabal e2e", function () {
  this.timeout(1000000);

  let circuit;
  before(async () => {
    circuit = await wasm_tester(
      path.join(__dirname, "circuits", "VerifyCabal_86_3_2.circom")
    );
    await circuit.loadConstraints();
  });

  it("e2e test 1", async () => {
    console.log(circuit);
    // TODO
  });
});
