import Contract from '../index';
import Provider from '../../provider';
import { includes } from 'lodash';

describe('Smart contract integration', () => {
  it('can be init success', () => {
    const provider = Provider('http://localhost:8545');
    const byteCode =
      '608060405234801561001057600080fd5b506040516102ec3803806102ec83398101604090815281516020808401519284015160008390556001849055909301805191939091610055916002919084019061005e565b505050506100f9565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061009f57805160ff19168380011785556100cc565b828001600101855582156100cc579182015b828111156100cc5782518255916020019190600101906100b1565b506100d89291506100dc565b5090565b6100f691905b808211156100d857600081556001016100e2565b90565b6101e4806101086000396000f3006080604052600436106100565763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416636257a38e811461005b5780636854171d146100e5578063f3acae3a1461010c575b600080fd5b34801561006757600080fd5b50610070610121565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100aa578181015183820152602001610092565b50505050905090810190601f1680156100d75780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156100f157600080fd5b506100fa6101ac565b60408051918252519081900360200190f35b34801561011857600080fd5b506100fa6101b2565b6002805460408051602060018416156101000260001901909316849004601f810184900484028201840190925281815292918301828280156101a45780601f10610179576101008083540402835291602001916101a4565b820191906000526020600020905b81548152906001019060200180831161018757829003601f168201915b505050505081565b60005481565b600154815600a165627a7a72305820c794fd234d6e3bd653612f115f706913df36e9720405e846b72bf446fea48eb10029';
    const abi = JSON.parse(
      '[{"constant":true,"inputs":[],"name":"v3","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"v1","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"v2","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_v1","type":"uint256"},{"name":"_v2","type":"uint256"},{"name":"_v3","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]'
    );
    const contract = Contract(provider, byteCode, abi);
    const result = contract.info();
    expect(result).toEqual({
      abi: [
        {
          constant: true,
          inputs: [],
          name: 'v3',
          outputs: [{ name: '', type: 'string' }],
          payable: false,
          stateMutability: 'view',
          type: 'function'
        },
        {
          constant: true,
          inputs: [],
          name: 'v1',
          outputs: [{ name: '', type: 'uint256' }],
          payable: false,
          stateMutability: 'view',
          type: 'function'
        },
        {
          constant: true,
          inputs: [],
          name: 'v2',
          outputs: [{ name: '', type: 'uint256' }],
          payable: false,
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [
            { name: '_v1', type: 'uint256' },
            { name: '_v2', type: 'uint256' },
            { name: '_v3', type: 'string' }
          ],
          payable: false,
          stateMutability: 'nonpayable',
          type: 'constructor'
        }
      ],
      byteCode:
        '608060405234801561001057600080fd5b506040516102ec3803806102ec83398101604090815281516020808401519284015160008390556001849055909301805191939091610055916002919084019061005e565b505050506100f9565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061009f57805160ff19168380011785556100cc565b828001600101855582156100cc579182015b828111156100cc5782518255916020019190600101906100b1565b506100d89291506100dc565b5090565b6100f691905b808211156100d857600081556001016100e2565b90565b6101e4806101086000396000f3006080604052600436106100565763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416636257a38e811461005b5780636854171d146100e5578063f3acae3a1461010c575b600080fd5b34801561006757600080fd5b50610070610121565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100aa578181015183820152602001610092565b50505050905090810190601f1680156100d75780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156100f157600080fd5b506100fa6101ac565b60408051918252519081900360200190f35b34801561011857600080fd5b506100fa6101b2565b6002805460408051602060018416156101000260001901909316849004601f810184900484028201840190925281815292918301828280156101a45780601f10610179576101008083540402835291602001916101a4565b820191906000526020600020905b81548152906001019060200180831161018757829003601f168201915b505050505081565b60005481565b600154815600a165627a7a72305820c794fd234d6e3bd653612f115f706913df36e9720405e846b72bf446fea48eb10029',
      provider: { baseLink: 'http://localhost:8545', version: '0.0.1' }
    });
  });

  describe('deploy function', () => {
    const provider = Provider('http://localhost:8545');
    const byteCode =
      '608060405234801561001057600080fd5b506078600055606f6001556101e48061002a6000396000f3006080604052600436106100565763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416636257a38e811461005b5780636854171d146100e5578063f3acae3a1461010c575b600080fd5b34801561006757600080fd5b50610070610121565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100aa578181015183820152602001610092565b50505050905090810190601f1680156100d75780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156100f157600080fd5b506100fa6101ac565b60408051918252519081900360200190f35b34801561011857600080fd5b506100fa6101b2565b6002805460408051602060018416156101000260001901909316849004601f810184900484028201840190925281815292918301828280156101a45780601f10610179576101008083540402835291602001916101a4565b820191906000526020600020905b81548152906001019060200180831161018757829003601f168201915b505050505081565b60005481565b600154815600a165627a7a7230582063c81e14aa83d40b5f05ad003561c9c2ff8e0bde10847c47a6675b30d7e1c4ec0029';
    const abi = JSON.parse(
      '[{"constant":true,"inputs":[],"name":"v3","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"v1","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"v2","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]'
    );
    const contract = Contract(provider, byteCode, abi);
    it('has deploy function', () => {
      expect(contract.deploy()).toBeDefined();
    });
    it('returns combined binary code', async () => {
      const txData = await contract.deploy().txData();
      // .send(
      //   '0x77cfc693f7861a6e1ea817c593c04fbc9b63d4d3146c5753c008cfc67cffca79',
      //   {
      //     gas: 4800000,
      //     gasPrice: 1
      //   }
      // );
      // console.log(txData);
      const isContentBytecode = includes(
        txData,
        '608060405234801561001057600080fd5b506078600055606f6001556101e48061002a6000396000f3006080604052600436106100565763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416636257a38e811461005b5780636854171d146100e5578063f3acae3a1461010c575b600080fd5b34801561006757600080fd5b50610070610121565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100aa578181015183820152602001610092565b50505050905090810190601f1680156100d75780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156100f157600080fd5b506100fa6101ac565b60408051918252519081900360200190f35b34801561011857600080fd5b506100fa6101b2565b6002805460408051602060018416156101000260001901909316849004601f810184900484028201840190925281815292918301828280156101a45780601f10610179576101008083540402835291602001916101a4565b820191906000526020600020905b81548152906001019060200180831161018757829003601f168201915b505050505081565b60005481565b600154815600a165627a7a7230582063c81e14aa83d40b5f05ad003561c9c2ff8e0bde10847c47a6675b30d7e1c4ec0029'
      );
      expect(isContentBytecode).toEqual(true);
      // const params = txData.replace('0x' + byteCode, '');
      // expect(txData).toEqual(
      //   '000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000036162630000000000000000000000000000000000000000000000000000000000'
      // );
    });
  });
  // it('abc', async () => {
  //   const provider = Provider('http://192.168.3.3:8545');
  //   const abi = [
  //     {
  //       constant: true,
  //       inputs: [{ name: 'toProposal', type: 'uint8' }],
  //       name: 'getVote',
  //       outputs: [{ name: '', type: 'uint256' }],
  //       payable: false,
  //       stateMutability: 'view',
  //       type: 'function'
  //     },
  //     {
  //       constant: true,
  //       inputs: [],
  //       name: 'winningProposal',
  //       outputs: [{ name: '_winningProposal', type: 'uint8' }],
  //       payable: false,
  //       stateMutability: 'view',
  //       type: 'function'
  //     },
  //     {
  //       constant: false,
  //       inputs: [{ name: 'toProposal', type: 'uint8' }],
  //       name: 'vote',
  //       outputs: [],
  //       payable: false,
  //       stateMutability: 'nonpayable',
  //       type: 'function'
  //     }
  //   ];
  //   const contract = Contract(provider, '', abi);
  //   const result = await contract
  //     // .invoke({ params: [3], name: 'vote' })
  //     // .send(
  //     //   '0x049de018e08c3bcd59c1a21f0cf7de8f17fe51f8ce7d9c2120d17b1f0251b265',
  //     //   '0x00000000000000000000000000000000736d6332',
  //     //   {
  //     //     gas: 70000,
  //     //     gasPrice: 256
  //     //   }
  //     // );
  //     //
  //     .invoke({ params: [3], name: 'getVote' })
  //     .call(
  //       '0xc1fe56E3F58D3244F606306611a5d10c8333f1f6',
  //       '0x00000000000000000000000000000000736d6332',
  //       {
  //         gas: 70000,
  //         gasPrice: 256
  //       }
  //     );
  //
  //   console.log(result);
  // });
});