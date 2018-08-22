import httpProvider from '../../provider/httpProvider';
import Api from '../index';

describe('api test', () => {
  it('work success', async () => {
    const api = Api(httpProvider('http://35.198.245.107:8545/'));
    try {
      const result = await api.coinBase();
    } catch (err) {
      console.log('err', err.message);
    }
  });
});
