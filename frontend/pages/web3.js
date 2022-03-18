import { ethers } from 'ethers'

let signer, provider, network

function changeNetworkName(network) {
  switch (network.chainId) {
    case 1:
      network.name = 'mainnet'
      return network
    default:
      return network
  }
}

export async function setupWeb3() {
  provider = new ethers.providers.Web3Provider(window.ethereum)
  await provider.send('eth_requestAccounts', [])
  const currentNetwork = await provider.getNetwork()

  provider.on('network', (newNetwork, oldNetwork) => {
    if (oldNetwork) {
      window.location.reload()
      network = changeNetworkName(newNetwork)
    }
  })
  const signer = provider.getSigner()
  return { provider, signer, network: changeNetworkName(currentNetwork) }
}

export const getProvider = () => provider
export const getSigner = () => signer
export const getNetwork = () => network
