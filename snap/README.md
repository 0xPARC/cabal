# Metamask Snap for zk proof generation

### Local development
- Geneate merkle tree tree.json, this would be used to get merkle proof
```
cd ../rootgen
yarn build
cp output/tree.json ../snap
```

- Serve snap locally
```
yarn && yarn build:clean && yarn serve
```

Note: index.html is only to make local development more convenient, not used in production

#### Metamask
To use Metamask, use this branch: https://github.com/MetaMask/metamask-extension/pull/14256 for now
