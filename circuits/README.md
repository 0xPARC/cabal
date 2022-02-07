Follow the intructions here to get circom2 (the ZKSnark compiler) installed in your system
https://docs.circom.io/getting-started/installation/

You should probably also install VSCode extension to work with circom.

Run `yarn install` to install dependencies.

```
cd circuits
circom multiplier2.circom --r1cs --wasm --sym --c
```
