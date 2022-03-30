import { writeFileSync } from 'fs';

import pkg  from 'csvtojson';
const { csv } = pkg;

import { buildTree } from './src/merkle.mjs';
import { getDevconAddresses, jsonToAddresses } from './src/addresses.mjs';
import { buildSampleInput } from './src/sample_input.mjs';

const args = process.argv.slice(2);
let addresses;
if (args[0] === 'json') {
  addresses = await jsonToAddresses(args[1]);
} else {
  addresses = await getDevconAddresses('./data');
}

// NOTE: currently only builds depth 10 trees, but can change here
let tree = await buildTree(addresses);
writeFileSync('output/tree.json', JSON.stringify(
  tree,
  (k, v) =>  typeof v == 'bigint' ? v.toString() : v,
  2
));

let sampleInput = buildSampleInput();
writeFileSync('output/sample_input.json', JSON.stringify(
  sampleInput,
  (k, v) =>  typeof v == 'bigint' ? v.toString() : v,
  2
));
