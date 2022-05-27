const path = require("path");
const wasm_tester = require("circom_tester").wasm;
const ethers = require("ethers");
const utils = require("./utils.js");
const bigintToTuple = utils.bigintToTuple;
const pubkeyStrToXY = utils.pubkeyStrToXY;

describe("ChunkedPubkeyToAddress", function () {
  this.timeout(1000 * 1000);

  it("test a few known addresses", async () => {
    let circuit = await wasm_tester(path.join(__dirname, "circuits", "pk_to_addr_64_4.circom"));

    const pubkeys = [
      "0x041f61660af8a701ea45bf251babdd07c371d278c3b412f6ad33f3ac6d11e34dee33bb3f55f2112b0e19e455ad503afdeade15be066d761da607e617785ad299f7",
      "0x048136724af4cb9772365b52539bda0264147d8d5c6018f984f5641a3e24552fe23c22015f0594f92c54a8b66db34392abf63715b6d158615ceb8835e5d9c26a22",
      "0x0406d0ff7a3cd3daed4e25e968f49a1dc2345b6e23b18ab32cc4ca3cca90a592bc6861754ad1f6eb53d59ae2db4f56cb39b37a588885e53351afe6ab796bb9624c",
      "0x04b9bb9c1d7c7ccdd67a9b129be5cda22847957b0b3c0d243e52ef94ed15d23bb825ed956e2ff6625d371bfe9f45724a635c9b65a2779eaebff5be19fdddaedadf",
      "0x04d8a03c4cdea58ad05e5b3e429d0bfbd6695e24325ac9c262ea5a8ec03ba7f1668c36164620b383f4b4d3121e4081c82312c983d88e64d25db986166e2f394876",
    ];

    for (let pubkey of pubkeys) {
      let address = ethers.utils.computeAddress(pubkey);

      let [x, y] = pubkeyStrToXY(pubkey);

      const w = await circuit.calculateWitness(
        {
          chunkedPubkey: [bigintToTuple(x), bigintToTuple(y)],
        },
        true
      );
      await circuit.assertOut(w, { address: BigInt(address) });
      await circuit.checkConstraints(w);
    }
  });
});

describe("ECDSAPrivToAddress", function () {
  this.timeout(1000 * 1000);

  it("test a few known privkeys", async () => {
    let circuit = await wasm_tester(
      path.join(__dirname, "circuits", "priv_to_address_64_4.circom")
    );

    // NOTE: same as circom-ecdsa test cases
    let testPrivs = [
      "0xc3c50b95a58172a4cce3e76629276a627a6d8626bcbbb7762e521207bbc59761",
      "0x535d586f561155c728815b18c7a6836e4c8863d9a24a571818c49ad50a6a079c",
      "0xc7d5ce7bee4ad0cd41c16aa685016b14ac5547575b84a574324c1fdd7eb54619",
      "0xf55ac2f52c4b3712a7819ffdc4be600315e57767c081a8d43b2e41cdb0eda0cb",
    ];

    for (let priv of testPrivs) {
      let address = ethers.utils.computeAddress(priv);

      const w = await circuit.calculateWitness(
        {
          privkey: bigintToTuple(BigInt(priv)),
        },
        true
      );
      await circuit.assertOut(w, { address: BigInt(address) });
      await circuit.checkConstraints(w);
    }
  });
});
