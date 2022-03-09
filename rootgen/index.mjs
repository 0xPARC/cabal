import { Buffer } from 'buffer';
import { writeFileSync } from 'fs';

import { buildPoseidon } from 'circomlibjs';

import pkg  from 'csvtojson';
const { csv } = pkg;

const poseidon = await buildPoseidon();

// NOTE: picked this as the null field element because it's known to not be in the tree
const NULL_NODE = 1;

// TODO: add other addresses we have access to?
const TESTER_ADDRS = [
  '0xDE3002E0e11300d44e96929576F71958f5DDc859' // address in sample_input.json
]

// NOTE: prod designates that we don't include TESTER_ADDRS as winners
async function buildTree(winners, prod = false) {
  if (!prod) {
    winners = winners.concat(TESTER_ADDRS);
  }

  winners.sort();

  // the equivalent of pathElements and pathIndices in merkle.circom
  let leafToPathElements = Object.fromEntries( winners.map(w => [w, []] ) );
  let leafToPathIndices = Object.fromEntries( winners.map(w => [w, []] ) );

  let nodeToLeaves = Object.fromEntries( winners.map(w => [w,[w]] ) );
  let curLevel = winners;
  while (curLevel.length > 1) {
    let newLevel = [];

    for (let i = 0; i < curLevel.length; i+=2) {
      let child1 = curLevel[i];
      let child2 = (i == curLevel.length - 1) ? NULL_NODE : curLevel[i+1];

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

      let parentBytes = poseidon([Number(child1), Number(child2)]);
      let parent = '0x' + Buffer.from(parentBytes).toString('hex');

      nodeToLeaves[parent] = child1Leaves.concat(child2Leaves);

      newLevel.push(parent);
    }

    curLevel = newLevel;
  }

  return {
    root: curLevel[0],
    leafToPathElements,
    leafToPathIndices
  }
}

async function getAddresses(csvFile) {
  const rows = await csv().fromFile(csvFile);
  return rows.map(r => r['Collection']);
}

async function getDevconAddresses() {
  const allAddresses = (await getAddresses('data/Devcon1.csv')).concat(
    await getAddresses('data/Devcon2.csv'),
    await getAddresses('data/Devcon3.csv'),
    await getAddresses('data/Devcon4.csv'),
    await getAddresses('data/Devcon5.csv'),
    await getAddresses('data/Devcon2 by Piper Merriam.csv')
  );

  return [...new Set(allAddresses)]
}

let addresses = await getDevconAddresses();
let tree = await buildTree(addresses);
writeFileSync('output/tree.json', JSON.stringify(tree, null, 2));
