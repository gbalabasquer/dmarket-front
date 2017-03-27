// console.log('package-post-init start')
Contracts.init = function init(env) {
  if (env === 'test' || env === 'kovan') {
    Contracts.env = 'kovan';
    Contracts['Market'].objects = Contracts['Market'].at('0x273f720a00c377c08c37cf8ba18f9a42b8b3847b');
  } else if (env === 'ropsten') {
    Contracts.env = 'ropsten';
    Contracts['Market'].at('');
  } else if (env === 'live' || env === 'main') {
    Contracts.env = 'live';
    Contracts['Market'].at('');
  } else if (env === 'private' || env === 'default') {
    Contracts['Market'].at('');
  }

  if (env !== false) {
    // Check if contract exists on new environment
    // const contractAddress = Contracts['maker-otc'].environments[Contracts.env].otc.value;
    // web3.eth.getCode(contractAddress, (error, code) => {
    //   Session.set('contractExists', !error && typeof code === 'string' && code !== '' && code !== '0x');
    // });
  }
};

// XXX generated blocknumbers, should use incremental lookback instead
Contracts.getFirstContractBlock = () => {
  let blockNumber = 0;
  if (Contracts.env === 'live') {
    blockNumber = 1;
  } else if (Contracts.env === 'ropsten') {
    blockNumber = 1;
  } else if (Contracts.env === 'kovan') {
    blockNumber = 485419;
  }
  return blockNumber;
};

const tokens = {
  kovan: {
    'W-ETH': '0x53eccc9246c1e537d79199d0c7231e425a40f896',
    DAI: '0x0000000000000000000000000000000000000000',
    MKR: '0x4bb514a7f83fbb13c2b41448208e89fabbcfe2fb',
    DGD: '0xbb7697d091a2b9428053e2d42d088fcd2a6a0aaf',
    GNT: '0xece9fa304cc965b00afc186f5d0281a00d3dbbfd',
    'W-GNT': '0xbd1ceb35769eb44b641c8e257005817183fc2817',
    REP: '0x99e846cfe0321260e51963a2114bc4008d092e24',
    ICN: '0x8a55df5de91eceb816bd9263d2e5f35fd516d4d0',
    '1ST': '0x846f258ac72f8a60920d9b613ce9e91f8a7a7b54',
    SNGLS: '0xf7d57c676ac2bc4997ca5d4d34adc0d072213d29',
    VSL: '0x2e65483308968f5210167a23bdb46ec94752fe39',
    PLU: '0x00a0fcaa32b47c4ab4a8fdda6d108e5c1ffd8e4f',
    MLN: '0xc3ce96164012ed51c9b1e34a9323fdc38c96ad8a',
  },
  ropsten: {
    'W-ETH': '0xece9fa304cc965b00afc186f5d0281a00d3dbbfd',
    DAI: '0x0000000000000000000000000000000000000000',
    MKR: '0xa7f6c9a5052a08a14ff0e3349094b6efbc591ea4',
    DGD: '0x1ab3bd2e2670d6e00ca406217e4d327f7f946d7e',
    GNT: '0x7fb3c4ff78bd0305a6ec436eda79303f981c5938',
    'W-GNT': '0xa5d92f318247c3b43241436dbb55ec4be600dc42',
    REP: '0xf75caa57375a75dfc1a7ea917d6abb2c95511053',
    ICN: '0x5b73d26807ea72287bafa1a27fccf8ece5deabc4',
    '1ST': '0xa8c784efdfe7d48bc5df28f770b6454a037e2abe',
    SNGLS: '0xf48cf5ad04afa369fe1ae599a8f3699c712b0352',
    VSL: '0x5017f42cf680fcbcab1093263468745c9af63e35',
    PLU: '0xcfe185ce294b443c16dd89f00527d8b25c45bf9d',
    MLN: '0xd4a8f8293d639752e263be3869057eaf7536e005',
  },
  live: {
    'W-ETH': '0xecf8f87f810ecf450940c9f60066b4a7a501d6a7',
    DAI: '0x0000000000000000000000000000000000000000',
    MKR: '0xc66ea802717bfb9833400264dd12c2bceaa34a6d',
    DGD: '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a',
    GNT: '0xa74476443119a942de498590fe1f2454d7d4ac0d',
    'W-GNT': '0x01afc37f4f85babc47c0e2d0eababc7fb49793c8',
    REP: '0x48c80f1f4d53d5951e5d5438b54cba84f29f32a5',
    ICN: '0x888666ca69e0f178ded6d75b5726cee99a87d698',
    '1ST': '0xaf30d2a7e90d7dc361c8c4585e9bb7d2f6f15bc7',
    SNGLS: '0xaec2e87e0a235266d9c5adc9deb4b2e29b54d009',
    VSL: '0x5c543e7ae0a1104f78406c340e9c64fd9fce5170',
    PLU: '0xd8912c10681d8b21fd3742244f44658dba12264e',
    MLN: '0xbeb9ef514a379b997e0798fdcc901ee474b6d9a1',
  },
};

// http://numeraljs.com/ for formats
const tokenSpecs = {
  'W-ETH': { precision: 18, format: '0,0.00[0000000000000000]' },
  DAI: { precision: 18, format: '0,0.00[0000000000000000]' },
  MKR: { precision: 18, format: '0,0.00[0000000000000000]' },
  DGD: { precision: 9, format: '0,0.00[0000000]' },
  GNT: { precision: 18, format: '0,0.00[0000000000000000]' },
  'W-GNT': { precision: 18, format: '0,0.00[0000000000000000]' },
  REP: { precision: 18, format: '0,0.00[0000000000000000]' },
  ICN: { precision: 18, format: '0,0.00[0000000000000000]' },
  '1ST': { precision: 18, format: '0,0.00[0000000000000000]' },
  SNGLS: { precision: 0, format: '0,0' },
  VSL: { precision: 18, format: '0,0.00[0000000000000000]' },
  PLU: { precision: 18, format: '0,0.00[0000000000000000]' },
  MLN: { precision: 18, format: '0,0.00[0000000000000000]' },
};

Contracts.getBaseTokens = () => ['W-ETH'];

Contracts.getQuoteTokens = () => ['MKR', 'DGD', 'W-GNT', 'REP', 'ICN', '1ST', 'SNGLS', 'VSL', 'PLU', 'MLN'];

Contracts.getTokens = () => ['W-ETH', 'MKR', 'DGD', 'GNT', 'W-GNT', 'REP', 'ICN', '1ST', 'SNGLS', 'VSL', 'PLU', 'MLN'];

Contracts.getTokenSpecs = (symbol) => {
  if (typeof (tokenSpecs[symbol]) !== 'undefined') {
    return tokenSpecs[symbol];
  }
  return tokenSpecs['W-ETH'];
};

Contracts.getTokenAddress = (symbol) => tokens[Contracts.env][symbol];

Contracts.getTokenByAddress = (address) => _.invert(tokens[Contracts.env])[address];

Contracts.getToken = (symbol, callback) => {
  if (!(Contracts.env in tokens)) {
    callback('Unknown environment', null);
    return;
  }
  if (!(symbol in tokens[Contracts.env])) {
    callback(`Unknown token "${symbol}"`, null);
    return;
  }

  const address = Contracts.getTokenAddress(symbol);

  let tokenClass = 'DSTokenBase';
  if (symbol === 'W-ETH') {
    tokenClass = 'DSEthToken';
  } else if (symbol === 'W-GNT') {
    tokenClass = 'TokenWrapper';
  }

  try {
    Contracts[tokenClass].at(address, (error, token) => {
      if (!error) {
        // token.abi = that.classes[tokenClass].abi;
        callback(false, token);
      } else {
        callback(error, token);
      }
    });
  } catch (e) {
    callback(e, null);
  }
};
