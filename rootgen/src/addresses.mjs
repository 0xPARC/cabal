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

  return [...new Set(allAddresses)].map(BigInt);
}

async function getYearToAddresses(dataDir) {
  const Addresses1 = await getAddresses(`${dataDir}/Devcon1.csv`);
  const Addreses2 = (await getAddresses(`${dataDir}/Devcon2.csv`)).concat(
    await getAddresses(`${dataDir}/Devcon2 by Piper Merriam.csv`)
  );
  const Addresses3 = await getAddresses(`${dataDir}/Devcon3.csv`);
  const Addresses4 = await getAddresses(`${dataDir}/Devcon4.csv`);
  const Addresses5 = await getAddresses(`${dataDir}/Devcon5.csv`);

  return {
    1: Addresses1,
    2: [...new Set(Addreses2)],
    3: Addresses3,
    4: Addresses4,
    5: Addresses5
  }
}

export { getDevconAddresses, getYearToAddresses }
