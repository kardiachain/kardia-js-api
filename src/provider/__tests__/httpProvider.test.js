import httpProvider from '../httpProvider';

describe('httpProvider', () => {
  it('returns an closure object', () => {
    const result = httpProvider('http://localhost');
    expect(result).toEqual(
      expect.objectContaining({
        version: '0.0.1',
        updateBaseLink: expect.any(Function),
        request: expect.any(Function)
      })
    );
  });
});
