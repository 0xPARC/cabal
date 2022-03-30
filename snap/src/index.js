import { deriveBIP44AddressKey } from '@metamask/key-tree';
import { getInput } from './snark_utils/get_input';
import { generateWitness, generateProof } from './snark_utils/generate_proof';

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  switch (requestObject.method) {
    case 'generateWitness':
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
      witness = await generateWitness(input);
      console.log("coming from index.js");
      console.log(witness);

      return {
        witness
      };
    case 'generateProof':
      const proof = await generateProof(witness);

      return {
        proof
      };
    default:
      throw new Error('Method not found.');
  }
});
