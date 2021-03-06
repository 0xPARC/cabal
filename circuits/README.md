### Setup

After you clone the repo, from the root of the repo run:
```
git submodule update --init
```

Follow the intructions here to get circom2 (the ZKSnark compiler) installed in your system
https://docs.circom.io/getting-started/installation/

You should probably also install VSCode extension to work with circom.

To install dependencies.
```
yarn install
cd circom-ecdsa
yarn install
```

```
mkdir zkeys
brew install wget # Needed for `downloadPtau` method of zkey-manager
```

### Compiling

We currently use [zkey-manager](https://github.com/appliedzkp/zkey-manager), a wrapper around snarkjs for our compilation pipeline.

To compile the circuits and generate proving+verification keys:

```
npx zkey-manager compile -c ./zkeys.config.yml
npx zkey-manager downloadPtau -c ./zkeys.config.yml
npx zkey-manager genZkeys -c ./zkeys.config.yml
```

You can then test proof generation locally against the input file `sample_input.json`.

First, generate the witness file:

```
node zkeys/VerifyCabal_64-4-10_prod_js/generate_witness.js zkeys/VerifyCabal_64-4-10_prod_js/VerifyCabal_64-4-10_prod.wasm sample_input.json sample_witness.wtns
```
Next, generate the proof and public inputs file and extract the verification key:

```
snarkjs groth16 prove zkeys/VerifyCabal_64-4-10_prod.0.zkey sample_witness.wtns proof.json public.json
snarkjs zkey export verificationkey zkeys/VerifyCabal_64-4-10_prod.0.zkey verification_key.json
```
Finally, verify the proof:

```
snarkjs groth16 verify verification_key.json public.json proof.json
```

### Building for snap

After compiling the circuits and generating proving+verification keys:

```
cp zkeys/VerifyCabal_64-4-10_prod.0.zkey ../snap/src/snark_utils/
cp zkeys/VerifyCabal_64-4-10_prod_js/VerifyCabal_86-3-10_prod.wasm ../snap/src/snark_utils/
```
