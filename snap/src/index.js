import { deriveBIP44AddressKey } from '@metamask/key-tree';
import { getInput } from './snark_utils/get_input';
import { generateProof } from './snark_utils/generate_proof';

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  switch (requestObject.method) {
    case 'generateProof':
      const ethNode = await wallet.request({
        method: 'snap_getBip44Entropy_60',
      });

      const extendedPrivateKey = deriveBIP44AddressKey(ethNode, {
        account: 0,
        address_index: 0,
        change: 0
      });
      const privateKey = extendedPrivateKey.slice(0, 32);

      const input = await getInput(privateKey);
      const proof = await generateProof(input);

      return proof;
    default:
      throw new Error('Method not found.');
  }
});
