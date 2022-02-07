Follow the intructions here to get circom2 (the ZKSnark compiler) installed in your system
https://docs.circom.io/getting-started/installation/

You should probably also install VSCode extension to work with circom.

Run `yarn install` to install dependencies.

```
mkdir zkeys
brew install wget # Needed for `downloadPtau` method of zkey-manager
```

```
npx zkey-manager compile -c ./zkeys.config.yml
npx zkey-manager downloadPtau -c ./zkeys.config.yml
npx zkey-manager genZkeys -c ./zkeys.config.yml

cp zkeys/VerifyDfWinner_86-3-8_prod.0.zkey ../frontend/public/
cp zkeys/VerifyDfWinner_86-3-8_prod_js/VerifyDfWinner_86-3-8_prod.wasm ../frontend/public/
```
