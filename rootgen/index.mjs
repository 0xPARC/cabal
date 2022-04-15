import { writeFileSync } from 'fs';

import pkg  from 'csvtojson';
const { csv } = pkg;

import { buildTree } from './src/merkle.mjs';
import { getDevconAddresses, jsonToAddresses } from './src/addresses.mjs';
import { buildSampleInput } from './src/sample_input.mjs';

async function genAndWriteTree(addresses, outputFile) {
  let tree = await buildTree(addresses);
  writeFileSync(outputFile, JSON.stringify(
    tree,
    (k, v) =>  typeof v == 'bigint' ? v.toString() : v,
    2
  ));
}

const args = process.argv.slice(2);
if (args[0] === 'json') {
  // use json arg for tree
  let addresses = await jsonToAddresses(args[1]);
  await genAndWriteTree(addresses, 'output/tree.json');
} else {
  // gen tree for each devcon csv
  for (let i=1; i<=5; i++) {
    let addresses = await getDevconAddresses('./data', i);
    await genAndWriteTree(addresses, `output/tree${i}.json`);
  }
}

let sampleInput = buildSampleInput();
writeFileSync('output/sample_input.json', JSON.stringify(
  sampleInput,
  (k, v) =>  typeof v == 'bigint' ? v.toString() : v,
    2
));

