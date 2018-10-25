import abi from 'ethereumjs-abi';
import Contract, { parseOutput } from '../index';

describe('decode output Object', () => {
  it('it decode with correct data', () => {
    const result =
      '0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000313041310000000000000000000000000000000000000000000000000000000031304132000000000000000000000000000000000000000000000000000000000000001175706461746554656163686572496e666f000000000000000000000000000000';
    const outputs = [
      {
        name: 'ids',
        type: 'bytes32[]',
      },
      {
        name: 'name',
        type: 'string',
      },
    ];
    const finalResult = parseOutput(outputs, result);
    expect(finalResult).toEqual({
      ids: [
        '0x0000000000000000000000000000000000000000000000000000000031304131',
        '0x0000000000000000000000000000000000000000000000000000000031304132',
      ],
      name: 'updateTeacherInfo',
    });
  });
});
describe('test decode abi', () => {
  it('parse correct data', () => {
    var a = abi.rawDecode(
      ['bytes'],
      new Buffer(
        '0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c64000000000000000000000000000000000000000000',
        'hex',
      ),
    );
    console.log(a[0].toString('hex'));

    var b = new Buffer('68656c6c6f20776f726c64', 'hex');
    console.log(b.toString('hex'));
    expect(a[0].toString('hex')).toEqual(b.toString('hex'));
  });
});

describe('test deccode event data', () => {
  it('parses to non index event object correctly', () => {
    const abi = [
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: 'data',
            type: 'int256',
          },
          {
            indexed: false,
            name: 'sender',
            type: 'address',
          },
        ],
        name: 'onDataChange',
        type: 'event',
      },
      {
        constant: false,
        inputs: [
          {
            name: '_data',
            type: 'int256',
          },
        ],
        name: 'setData',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        constant: true,
        inputs: [],
        name: 'data',
        outputs: [
          {
            name: '',
            type: 'int256',
          },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
    ];
    const logObject = {
      address: '0xc8ce51433956dcfebbbd3b9e3a1785551152f300',
      blockHash:
        '0xe1702a80ad9c9a29450148dac68ce44e55058d76692ee5b0b5cff894a5973deb',
      blockNumber: '0x30fac0',
      data:
        '0x000000000000000000000000000000000000000000000000000000000000006400000000000000000000000077bb8974c20d9adb0745a37d48b3e1ec0fad63e9',
      logIndex: '0x17',
      removed: false,
      topics: [
        '0xde4d4e60b744af94c30375925bf8ca57a1bc25774fdb5e7532289148ea39bc62',
      ],
      transactionHash:
        '0x04c2cb8287f1d57ddd9e2348e2558ed92246e4aff451086a3c01510e2d1a160c',
      transactionIndex: '0x10',
    };
    const contract = Contract(null, null, abi);
    const event = contract.eventParser(logObject);
    console.log(event);
    expect(event).toEqual({
      event: {
        data: 100,
        name: 'onDataChange',
        sender: '0x77bb8974c20d9adb0745a37d48b3e1ec0fad63e9',
      },
      ...logObject,
    });
  });
  it('parses to indexed event object correctly', () => {
    const abi = [
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: 'data',
            type: 'int256',
          },
          {
            indexed: true,
            name: 'sender',
            type: 'address',
          },
          {
            indexed: false,
            name: 'senderA',
            type: 'address',
          },
          {
            indexed: true,
            name: 'preValue',
            type: 'int256',
          },
        ],
        name: 'onDataChange',
        type: 'event',
      },
      {
        constant: false,
        inputs: [
          {
            name: '_data',
            type: 'int256',
          },
        ],
        name: 'setData',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        constant: true,
        inputs: [],
        name: 'data',
        outputs: [
          {
            name: '',
            type: 'int256',
          },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
    ];
    const logObject = {
      address: '0x8160b4f57d7a19736dc6d9dd5839b0de91775542',
      blockHash:
        '0x01ecab033e41f8b95e099a542633cb03fed983ea881d952c1bbfc9825c4b5869',
      blockNumber: '0x30fe4d',
      data:
        '0x00000000000000000000000000000000000000000000000000000000000000640000000000000000000000008160b4f57d7a19736dc6d9dd5839b0de91775542',
      logIndex: '0x6',
      removed: false,
      topics: [
        '0x60b97542a763039ad7c13c1b0d7e9a19f10f35572b2d62241fb6c0dba07287d4',
        '0x0000000000000000000000001abf127ee9147465db237ec986dc316985e03e3a',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ],
      transactionHash:
        '0xce7ea5bf86ccd0ad6dc079574971de8f2c408e33f323a18156cae83d8e279c44',
      transactionIndex: '0xa',
    };
    const contract = Contract(null, null, abi);
    const event = contract.eventParser(logObject);
    console.log(event);
    expect(event).toEqual({
      event: {
        data: 100,
        name: 'onDataChange',
        preValue: 0,
        sender: '0x8160b4f57d7a19736dc6d9dd5839b0de91775542',
        senderA: '0x1abf127ee9147465db237ec986dc316985e03e3a',
      },
      ...logObject,
    });
  });
});
