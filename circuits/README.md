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

```
npx zkey-manager compile -c ./zkeys.config.yml
npx zkey-manager downloadPtau -c ./zkeys.config.yml
npx zkey-manager genZkeys -c ./zkeys.config.yml

cp zkeys/VerifyCabal_64-4-10_prod.0.zkey ../snap/src/snark_utils/
cp zkeys/VerifyCabal_64-4-10_prod_js/VerifyCabal_64-4-10_prod.wasm ../snap/src/snark_utils/
```
