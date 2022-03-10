const path = require("path");

const chai = require("chai");
const circom_tester = require("circom_tester");

const utils = require("./utils");

const assert = chai.assert;
const wasm_tester = circom_tester.wasm;

const buildPoseidon = require("circomlibjs").buildPoseidon;

// for converting privkey to 3-tuple
function bigint_to_tuple(x) {
    // 2 ** 86
    let mod = 77371252455336267181195264n;
    let ret = [0n, 0n, 0n];

    var x_temp = x;
    for (var idx = 0; idx < 3; idx++) {
        ret[idx] = x_temp % mod;
        x_temp = x_temp / mod;
    }
    return ret;
}

describe("verify cabal e2e", function () {
  this.timeout(1000 * 1000);

  let circuit, poseidon;

  before(async () => {
    //circuit = await wasm_tester(
      //path.join(__dirname, "circuits", "VerifyCabal_86_3_2.circom")
    //);
    //await circuit.loadConstraints();
    poseidon = await buildPoseidon();
  });

  it("e2e test 1", async () => {
    //console.log(circuit);
    // random int
    // 0xCED2F1E92E4DFD7F4EE992040D34553A549A8D1243BBCD4BCCCA4E07BBB727DF (privkey)
    // 0xDE3002E0e11300d44e96929576F71958f5DDc859 (address)
    const privkey = 93549154299169935420023221163296845505523953610183896504176354567359433222111n;
    const privkey_tuple = bigint_to_tuple(privkey);
    const nullifier = poseidon.F.toObject(
        poseidon([privkey_tuple[0]])
    );

    console.log(nullifier);
    //console.log(nullifier);

    // merkle root of addresses, branch, etc.
  });
});
