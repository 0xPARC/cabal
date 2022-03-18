import pkg  from 'csvtojson';
const { csv } = pkg;

async function getAddresses(csvFile) {
  const rows = await csv().fromFile(csvFile);
  return rows.map(r => r['Collection']);
}

async function getDevconAddresses(dataDir) {
  const allAddresses = (await getAddresses(`${dataDir}/Devcon1.csv`)).concat(
    await getAddresses(`${dataDir}/Devcon2.csv`),
    await getAddresses(`${dataDir}/Devcon3.csv`),
    await getAddresses(`${dataDir}/Devcon4.csv`),
    await getAddresses(`${dataDir}/Devcon5.csv`),
    await getAddresses(`${dataDir}/Devcon2 by Piper Merriam.csv`)
  );

  return [...new Set(allAddresses)].map(Number).map(BigInt);
}

export { getDevconAddresses }
