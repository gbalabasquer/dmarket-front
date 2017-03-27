Package.describe({
  name: 'contracts:contracts',
  version: '0.0.1',
  summary: 'Contracts',
  git: '',
  documentation: 'README.md',
});

Package.onUse((api) => {
  api.versionsFrom('1.4.0.1');

  api.use('ecmascript', 'client');
  api.use('ethereum:web3', 'client');

  api.addFiles(['package-pre-init.js'], 'client');
  api.addFiles(['contracts/market.js'], 'client');
  api.addFiles(['contracts/dstokenbase.js'], 'client');
  api.addFiles(['contracts/dsethtoken.js'], 'client');
  api.addFiles(['contracts/tokenwrapper.js'], 'client');
  api.addFiles(['package-post-init.js'], 'client');

  api.export('web3', 'client');
  api.export('Contracts', 'client');
});
