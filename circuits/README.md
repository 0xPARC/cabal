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

### For cabal signature

Run `cd sig_example; node generate_sample_input.mjs; cd ../;` to generate the sample input json for the circuit.

Run the following to generate the witness

```
npx zkey-manager compile -c ./zkeys.config.yml
node zkeys/VerifySigCabal_64-4-10_prod_js/generate_witness.js zkeys/VerifySigCabal_64-4-10_prod_js/VerifySigCabal_64-4-10_prod.wasm sig_example/sig_sample_input.json sig_example/sig_sample_witness.wtns
```

For some reason, the zkey manager doesn't currently work with circuits with no outputs, I believe, so we have to generate the zkey manually...we should technically run a phase 2 powers of tau contribution here

(Should be able to run `npx zkey-manager genZkeys -c ./zkeys.config.yml`)

_The following command takes a long time (~30 minutes on a macbook pro)_

```
npx snarkjs groth16 setup zkeys/VerifySigCabal_64-4-10_prod.r1cs zkeys/powersOfTau28_hez_final_22.ptau zkeys/VerifySigCabal_64-4-10_prod.zkey
```

Export the vkey

```
npx snarkjs zkey export verificationkey zkeys/VerifySigCabal_64-4-10_prod.zkey zkeys/VerifySigCabal_64-4-10_prod_vkey.json
```

Generate a proof with the witness

```
npx snarkjs groth16 prove zkeys/VerifySigCabal_64-4-10_prod.zkey sig_example/sig_sample_witness.wtns sig_example/proof.json sig_example/public.json
```

Command for running full proof (no need for witness generation), although for some reason this does not work (get a `LinkError` for webassembly)

```
npx snarkjs groth16 fullprove sig_example/sig_sample_input.json zkeys/VerifySigCabal_64-4-10_prod_js/VerifySigCabal_64-4-10_prod.wasm zkeys/VerifySigCabal_64-4-10_prod.zkey sig_example/proof.json sig_example/public.json
```

To verify a proof

```
npx snarkjs groth16 verify zkeys/VerifySigCabal_64-4-10_prod_vkey.json sig_example/public.json sig_example/proof.json
```

To generate a proof using rapid snark

<circuit.zkey> <witness.wtns> <proof.json> <public.json>

/Users/uma/Documents/dev/rapidsnark/build/prover zkeys/VerifySigCabal_64-4-10_prod.zkey sig_example/sig_sample_witness.wtns sig_example/rapid_proof.json sig_example/rapid_public.json
