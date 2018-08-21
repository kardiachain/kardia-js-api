import httpProvider from '../../provider/httpProvider';
import Api from '../index';

describe('api test', () => {
  it('work success', async () => {
    const api = Api(httpProvider('http://35.198.245.107:8545/'));
    const result = await api.clientVerion();
    console.log(result);
  });
});
