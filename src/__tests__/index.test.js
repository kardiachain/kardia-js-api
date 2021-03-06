import kardiaTool from '../index';

describe('kardiaTool', () => {
  it('includes provider and common', () => {
    const host = 'http://localhost';
    expect(kardiaTool(host)).toEqual(
      expect.objectContaining({
        provider: expect.anything(),
        common: expect.anything()
      })
    );
  });
  it('is an object with common', () => {
    const host = 'http://localhost';
    expect(kardiaTool(host).common).toEqual(
      expect.objectContaining({
        createAccount: expect.any(Function),
        hexToNumber: expect.any(Function),
        hexToNumberString: expect.any(Function),
        hexToUtf8: expect.any(Function),
        isAddress: expect.any(Function),
        isBN: expect.any(Function),
        numberToHex: expect.any(Function),
        recoverTx: expect.any(Function),
        sign: expect.any(Function),
        toBN: expect.any(Function),
        txGenerator: expect.any(Function),
        utf8ToHex: expect.any(Function)
      })
    );
  });
  it('test address validate', () => {
    const address = '0x4C789cF0F4BEC40F315987185dF6F87EEC6447BA';
    const host = 'http://localhost';
    expect(kardiaTool(host).common.isAddress(address)).toBe(true);
  });
});
