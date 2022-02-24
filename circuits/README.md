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

cp zkeys/ECDSAPrivToPub_86-3-8_dev.0.zkey ../frontend/public/
cp zkeys/ECDSAPrivToPub_86-3_dev_js/ECDSAPrivToPub_86-3_dev.wasm ../frontend/public/
```
