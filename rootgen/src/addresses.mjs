import pkg  from 'csvtojson';
const { csv } = pkg;

async function getDevconCSVAddresses(csvFile) {
  const rows = await csv().fromFile(csvFile);
  return rows.map(r => r['Collection']);
}

async function getDevconAddresses(dataDir) {
  const allAddresses = (await getDevconCSVAddresses(`${dataDir}/Devcon1.csv`)).concat(
    await getDevconCSVAddresses(`${dataDir}/Devcon2.csv`),
    await getDevconCSVAddresses(`${dataDir}/Devcon3.csv`),
    await getDevconCSVAddresses(`${dataDir}/Devcon4.csv`),
    await getDevconCSVAddresses(`${dataDir}/Devcon5.csv`),
    await getDevconCSVAddresses(`${dataDir}/Devcon2 by Piper Merriam.csv`)
  );

  return [...new Set(allAddresses)].map(BigInt);
}

async function getYearToAddresses(dataDir) {
  const Addresses1 = await getDevconCSVAddresses(`${dataDir}/Devcon1.csv`);
  const Addreses2 = (await getDevconCSVAddresses(`${dataDir}/Devcon2.csv`)).concat(
    await getDevconCSVAddresses(`${dataDir}/Devcon2 by Piper Merriam.csv`)
  );
  const Addresses3 = await getDevconCSVAddresses(`${dataDir}/Devcon3.csv`);
  const Addresses4 = await getDevconCSVAddresses(`${dataDir}/Devcon4.csv`);
  const Addresses5 = await getDevconCSVAddresses(`${dataDir}/Devcon5.csv`);

  return {
    1: Addresses1,
    2: [...new Set(Addreses2)],
    3: Addresses3,
    4: Addresses4,
    5: Addresses5
  }
}

function getAddresses(addresses) {
  return [...new Set(addresses)].map(BigInt);
}

export { getDevconAddresses, getYearToAddresses }
