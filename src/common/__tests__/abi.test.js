import { methodData } from '../lib/abi';
import { toHex } from '../lib/utils';

describe('Encode function', () => {
  it('work correctly', () => {
    const tokenAbi = [
      {
        constant: false,
        inputs: [
          {
            name: 'xy',
            type: 'fixed128x18[2]'
          }
        ],
        name: 'bar',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: 'x',
            type: 'uint32'
          },
          {
            name: 'y',
            type: 'bool'
          }
        ],
        name: 'baz',
        outputs: [
          {
            name: 'r',
            type: 'bool'
          }
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: 'name',
            type: 'bytes'
          },
          {
            name: 'z',
            type: 'bool'
          },
          {
            name: 'data',
            type: 'uint256[]'
          }
        ],
        name: 'sam',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ];
    const result = methodData(tokenAbi[1], [toHex(999999999), toHex(true)]);
    expect(result).toBe(
      '0xcdcd77c0000000000000000000000000000000000000000000000000000000003b9ac9ff0000000000000000000000000000000000000000000000000000000000000001'
    );
    const result2 = methodData(tokenAbi[2], [
      toHex('dave'),
      toHex(true),
      [toHex(1), toHex(2), toHex(3)]
    ]);
    expect(result2).toBe(
      '0xa5643bf20000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000464617665000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003'
    );
  });
});
