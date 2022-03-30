import { buildPoseidon } from "circomlibjs";

const poseidon = await buildPoseidon();
const F = poseidon.F; // poseidon finite field

// NOTE: picked this as the null field element because it's known to not be in the tree
const NULL_NODE = 1;

// TODO: before prod, make sure to remove this!
const TESTER_ADDRS = [
  "0x4eaB0fA55a6c71c0c23BD0E67C06682b4Ce78A7f",
  "0xda1EA97d4c6D723125B26E4a1441C399d0EA0bE4",
  "0x05b9Df7825DE3c65A7D0386bD470F32a7008bC0c",
  "0xb032BA0CbF94CfE9A377aD4060624cA31CEEdE43",

  "0x4fe67C37Bf6439db25d4e3A65FD0DE50Dcd40A82", // NOTE: LS test mm address
  "0xBC4Ffd9cD21a127FB883e5d3d2e4697BB7B2Af20",
  "0xE5Af09a906B409D31aBffeCa0576D962fe46248A",
];

// NOTE: taken from cabal-xyz
async function buildTree(leaves, testAddrs = true) {
  if (testAddrs) {
    leaves = leaves.concat(TESTER_ADDRS);
  }

  leaves = leaves.map(BigInt);
  leaves.sort();

  // the equivalent of pathElements and pathIndices in merkle.circom
  let leafToPathElements = Object.fromEntries(leaves.map((w) => [w, []]));
  let leafToPathIndices = Object.fromEntries(leaves.map((w) => [w, []]));

  let nodeToLeaves = Object.fromEntries(leaves.map((w) => [w, [w]]));
  let curLevel = leaves;
  while (curLevel.length > 1) {
    let newLevel = [];

    for (let i = 0; i < curLevel.length; i += 2) {
      let child1 = curLevel[i];
      let child2 = i == curLevel.length - 1 ? NULL_NODE : curLevel[i + 1];

      let child1Leaves = nodeToLeaves[child1];
      let child2Leaves = child2 == NULL_NODE ? [] : nodeToLeaves[child2];

      for (const leaf of child1Leaves) {
        leafToPathElements[leaf].push(child2);
        leafToPathIndices[leaf].push(0);
      }

      for (const leaf of child2Leaves) {
        leafToPathElements[leaf].push(child1);
        leafToPathIndices[leaf].push(1);
      }

      let poseidonRes = poseidon([child1, child2]);
      let parent = F.toObject(poseidonRes);

      nodeToLeaves[parent] = child1Leaves.concat(child2Leaves);

      newLevel.push(parent);
    }

    curLevel = newLevel;
  }

  return {
    root: curLevel[0],
    leafToPathElements,
    leafToPathIndices,
  };
}

export { buildTree };
