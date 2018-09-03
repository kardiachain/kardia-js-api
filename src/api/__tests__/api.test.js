import httpProvider from '../../provider/httpProvider';
import Api from '../index';

// this one only use to interact with development chain, not use for testing
describe.skip('api test', () => {
  it('work success', async () => {
    const api = Api(httpProvider('http://localhost:8545'));
    const result = await api.blockByHash(
      '0xffad29f0b741a4f2280fe5288302202e2707531393b7dc27bff056eeab3ee521'
    );

    const result1 = await api.blockByNumber(1);
  });
});
