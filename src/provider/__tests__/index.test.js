import provider from '../index';

describe('provider', () => {
  describe('support http provider', () => {
    it('returns http provider when using http/https', () => {
      const httpProvider = provider('http://localhost:300');
      expect(httpProvider).toBeTruthy();
      const httpsProvider = provider('https://localhost:301');
      expect(httpsProvider).toBeTruthy();
    });
    it('throw error when input invalid provider', () => {
      expect(() => {
        provider('ws://localhost:300');
      }).toThrow();
    });
  });
});
