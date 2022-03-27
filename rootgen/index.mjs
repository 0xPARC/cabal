import { writeFileSync } from 'fs';

import pkg  from 'csvtojson';
const { csv } = pkg;

import { buildTree } from './src/merkle.mjs';
import { getDevconAddresses } from './src/addresses.mjs';
import { buildSampleInput } from './src/sample_input.mjs';

let addresses = await getDevconAddresses('./data');
let tree = await buildTree(addresses, true);

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
