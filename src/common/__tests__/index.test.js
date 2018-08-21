import { txGenerator, createAccount } from '../index';

describe('tx generator function', () => {
  it('is a function', () => {
    const result = txGenerator('0x', 1, '0x0', '0xff', '0xff', '0x');
    expect(result).toEqual({
      data: '0x',
      gas: '0xff',
      gasPrice: '0xff',
      nonce: '0x0',
      value: 1,
      to: '0x'
    });
  });
});

describe('createAccount function', () => {
  it('return and object include address and privateKey', () => {
    const account = createAccount();
    expect(account).toMatchObject({
      address: expect.any(String),
      privateKey: expect.any(String)
    });
  });
});
