import {deriveBIP44AddressKey} from '@metamask/key-tree';

// NOTE: this shows that we 'include' files in snap distribution during packaging
import * as testData from './test.json';

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  switch (requestObject.method) {
    case 'hello':
      const ethNode = await wallet.request({
        method: 'snap_getBip44Entropy_60',
      });

      const extendedPrivateKey = deriveBIP44AddressKey(ethNode, {
        account: 0,
        address_index: 0,
        change: 0
      });
      const privateKey = extendedPrivateKey.slice(0, 32);

      // NOTE: this is where we would process this for proof generation!

      return {
        privateKey,
        testData
      };
    default:
      throw new Error('Method not found.');
  }
});
