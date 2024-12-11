const sdk = require('@defillama/sdk');
const axios = require('axios');

const getRate_Contract = '0x387dBc0fB00b26fb085aa658527D5BE98302c84C';

const apy = async () => {

  const now = Math.floor(Date.now() / 1000);
  const timestamp1dayAgo = now - 86400;
  const timestamp7dayAgo = now - 86400 * 7;
  const timestamp30dayAgo = now - 86400 * 30;
  const block1dayAgo = (
    await axios.get(`https://coins.llama.fi/block/ethereum/${timestamp1dayAgo}`)
  ).data.height;

  const block7dayAgo = (
    await axios.get(`https://coins.llama.fi/block/ethereum/${timestamp7dayAgo}`)
  ).data.height;

  const block30dayAgo = (
    await axios.get(`https://coins.llama.fi/block/ethereum/${timestamp30dayAgo}`)
  ).data.height;

  const abi = 'function getRate() external view returns (uint256)';

  const exchangeRates = await Promise.all([
    sdk.api.abi.call({
      target: getRate_Contract,
      abi: abi,
    }),
    sdk.api.abi.call({
      target: getRate_Contract,
      abi: abi,
      block: block1dayAgo,
    }),
    sdk.api.abi.call({
      target: getRate_Contract,
      abi: abi,
      block: block7dayAgo,
    }),
    sdk.api.abi.call({
        target: getRate_Contract,
        abi: abi,
        block: block30dayAgo,
      }),
  ]);

  const apr1d =
    ((exchangeRates[0].output - exchangeRates[1].output) / exchangeRates[0].output)  * 365 * 100;

  const apr7d =
    ((exchangeRates[0].output - exchangeRates[2].output) / exchangeRates[0].output / 7)  * 365 *100;

  const apr30d = 
    ((exchangeRates[0].output - exchangeRates[3].output) / exchangeRates[0].output / 30)  * 365 *100;
  
  
  return [
    {
      chain: 'ethereum',
      project: 'renzo',
      symbol: 'ezETH',
      apyBase: apr30d,
    },
  ];
};

module.exports = {
  apy,
  url: 'https://app.renzoprotocol.com',
};
