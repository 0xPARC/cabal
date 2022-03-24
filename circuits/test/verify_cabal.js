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
  });
