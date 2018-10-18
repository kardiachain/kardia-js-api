import abi from 'ethereumjs-abi';

describe('test decode', () => {
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
