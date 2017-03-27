import { Session } from 'meteor/session';
import { Blaze } from 'meteor/blaze';
import { Spacebars } from 'meteor/spacebars';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { BigNumber } from 'meteor/ethereum:web3';
// import { EthTools } from 'meteor/ethereum:tools';
import { Contracts, web3 } from 'meteor/contracts:contracts';
import { moment } from 'meteor/momentjs:moment';

import Tokens from '/imports/api/tokens';
import { Offers } from '/imports/api/offers';

import { txHref, thousandSeparator, formatNumber } from '/imports/utils/functions';
import { convertFromTokenPrecision } from '/imports/utils/conversion';


Template.registerHelper('contractExists', () => {
  const network = Session.get('network');
  const isConnected = Session.get('isConnected');
  const exists = Session.get('contractExists');
  return network !== false && isConnected === true && exists === true;
});

Template.registerHelper('network', () => Session.get('network'));

Template.registerHelper('contractAddress', () => {
  let contractAddress = '';
  if (Contracts['Market'].objects) {
    contractAddress = Contracts['Market'].objects.address;
  }
  return contractAddress;
});

Template.registerHelper('contractHref', () => {
  let contractHref = '';
  if (Contracts['Market'].objects) {
    const network = Session.get('network');
    const networkPrefix = (network === 'kovan' ? 'kovan.' : '');
    const contractAddress = Contracts['Market'].objects.address;
    contractHref = `https://${networkPrefix}etherscan.io/address/${contractAddress}`;
  }
  return contractHref;
});

Template.registerHelper('txHref', (tx) => txHref(tx));

Template.registerHelper('marketCloseTime', () => Session.get('close_time'));

Template.registerHelper('isMarketOpen', () => Session.get('market_open'));

Template.registerHelper('ready', () =>
  // XXX disabled 'syncing' as parity is being very bouncy
  // Session.get('isConnected') && !Session.get('syncing') && !Session.get('outOfSync')
  Session.get('isConnected') && !Session.get('outOfSync')
);

Template.registerHelper('isConnected', () => Session.get('isConnected'));

Template.registerHelper('hasAccount', () => Session.get('address'));

Template.registerHelper('outOfSync', () => Session.get('outOfSync'));

Template.registerHelper('syncing', () => Session.get('syncing'));

Template.registerHelper('syncingPercentage', () => {
  const startingBlock = Session.get('startingBlock');
  const currentBlock = Session.get('currentBlock');
  const highestBlock = Session.get('highestBlock');
  return Math.round(100 * ((currentBlock - startingBlock) / (highestBlock - startingBlock)));
});

Template.registerHelper('loading', () => Session.get('loading'));

Template.registerHelper('loadingProgress', () => Session.get('loadingProgress'));

Template.registerHelper('loadingTradeHistory', () => Session.get('loadingTradeHistory'));

Template.registerHelper('loadedCurrencies', () => Session.get('balanceLoaded') === true
  && Session.get('allowanceLoaded') === true);

Template.registerHelper('address', () => Session.get('address'));

Template.registerHelper('ETHBalance', () => Session.get('ETHBalance'));

Template.registerHelper('GNTBalance', () => Session.get('GNTBalance'));

Template.registerHelper('allTokens', () => {
  const quoteToken = Session.get('quoteToken');
  const baseToken = Session.get('baseToken');
  return _.uniq([quoteToken, baseToken]).map((token) => Tokens.findOne(token));
});

Template.registerHelper('findToken', (token) => Tokens.findOne(token));

Template.registerHelper('countLastTrades', () => {
  const quoteToken = Session.get('quoteToken');
  const baseToken = Session.get('baseToken');
  const options = {};
  options.sort = { blockNumber: -1, transactionIndex: -1 };
  const obj = { $or: [
    { buyWhichToken: quoteToken, sellWhichToken: baseToken },
    { buyWhichToken: baseToken, sellWhichToken: quoteToken },
  ] };
  return Trades.find(obj, options).count();
});

Template.registerHelper('lastTrades', () => {
  const quoteToken = Session.get('quoteToken');
  const baseToken = Session.get('baseToken');
  const limit = Session.get('lastTradesLimit');
  const options = {};
  if (limit) {
    options.limit = limit;
  }
  options.sort = { blockNumber: -1, transactionIndex: -1 };
  const obj = { $or: [
    { buyWhichToken: quoteToken, sellWhichToken: baseToken },
    { buyWhichToken: baseToken, sellWhichToken: quoteToken },
  ] };
  return Trades.find(obj, options);
});

Template.registerHelper('countOffers', (type) => {
  const quoteToken = Session.get('quoteToken');
  const baseToken = Session.get('baseToken');
  const dustLimitMap = Session.get('orderBookDustLimit');
  const dustLimit = dustLimitMap[quoteToken] ? dustLimitMap[quoteToken] : 0;

  if (type === 'ask') {
    return Offers.find({ buyWhichToken: quoteToken, sellWhichToken: baseToken, buyHowMuch_filter: {$gte: dustLimit} }).count();
  } else if (type === 'bid') {
    return Offers.find({ buyWhichToken: baseToken, sellWhichToken: quoteToken, sellHowMuch_filter: {$gte: dustLimit} }).count();
  }
  return 0;
});

Template.registerHelper('findOffers', (type) => {
  const quoteToken = Session.get('quoteToken');
  const baseToken = Session.get('baseToken');
  const limit = Session.get('orderBookLimit');
  const dustLimitMap = Session.get('orderBookDustLimit');
  const dustLimit = dustLimitMap[quoteToken] ? dustLimitMap[quoteToken] : 0;

  const options = {};
  options.sort = { ask_price_sort: 1 };
  if (limit) {
    options.limit = limit;
  }

  if (type === 'ask') {
    return Offers.find({ buyWhichToken: quoteToken, sellWhichToken: baseToken, buyHowMuch_filter: {$gte: dustLimit} }, options);
  } else if (type === 'bid') {
    return Offers.find({ buyWhichToken: baseToken, sellWhichToken: quoteToken, sellHowMuch_filter: {$gte: dustLimit} }, options);
  } else if (type === 'mine') {
    const or = [
      { buyWhichToken: quoteToken, sellWhichToken: baseToken },
      { buyWhichToken: baseToken, sellWhichToken: quoteToken },
    ];
    const address = Session.get('address');
    return Offers.find({ owner: address, $or: or });
  }
  return [];
});

Template.registerHelper('findOffer', (id) => Offers.findOne(id));

Template.registerHelper('selectedOffer', () => Session.get('selectedOffer'));

Template.registerHelper('quoteToken', () => Session.get('quoteToken'));

Template.registerHelper('baseToken', () => Session.get('baseToken'));

Template.registerHelper('equals', (a, b) => a === b);

Template.registerHelper('not', (b) => !b);

Template.registerHelper('or', (a, b) => a || b);

Template.registerHelper('and', (a, b) => a && b);

Template.registerHelper('gt', (a, b) => a > b);

Template.registerHelper('concat', (...args) => Array.prototype.slice.call(args, 0, -1).join(''));

Template.registerHelper('timestampToString', (ts, inSeconds, short) => {
  let timestampStr = '';
  if (ts) {
    const momentFromTimestamp = (inSeconds === true) ? moment.unix(ts) : moment.unix(ts / 1000);
    if (short === true) {
      timestampStr = momentFromTimestamp.format('DD-MMM-HH:mm');
    } else {
      timestampStr = momentFromTimestamp.format();
    }
  }
  return timestampStr;
});

Template.registerHelper('log', (value) => {
  console.log(value);
});

Template.registerHelper('fromWei', (s) => web3.fromWei(s));

Template.registerHelper('toWei', (s) => web3.toWei(s));

Template.registerHelper('friendlyAddress', (address) => {
  /* eslint-disable no-underscore-dangle */
  if (address === Blaze._globalHelpers.contractAddress()) {
    return 'market';
  } else if (address === Blaze._globalHelpers.address()) {
    return 'me';
  }
  return `${address.substr(0, 9)}...`;
  /* eslint-enable no-underscore-dangle */
});

Template.registerHelper('fromPrecision', (value, precision) => {
  let displayValue = value;
  try {
    if (!(displayValue instanceof BigNumber)) {
      displayValue = new BigNumber(displayValue);
    }
    return displayValue.div(Math.pow(10, precision));
  } catch (e) {
    return new BigNumber(0);
  }
});

Template.registerHelper('validPrecision', (value, precision) => {
  let displayValue = value;
  /* let tokenPrecision = precision;
  if (isNaN(tokenPrecision)) {
    const tokenSpecs = Contracts.getTokenSpecs(precision);
    tokenPrecision = tokenSpecs.precision;
  }*/
  try {
    if (!(displayValue instanceof BigNumber)) {
      displayValue = new BigNumber(displayValue);
    }
    if (displayValue.dp() <= precision) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
});

Template.registerHelper('convertFromTokenPrecision', (amount, token) => {
  return convertFromTokenPrecision(amount, token)
});

Template.registerHelper('formatBalance', (wei, decimals, currency, sle) => {
  let decimalsValue = decimals;
  if (decimalsValue instanceof Spacebars.kw) {
    decimalsValue = null;
  }
  let showLabelExact = sle;
  if (showLabelExact instanceof Spacebars.kw) {
    showLabelExact = null;
  }
  decimalsValue = decimalsValue || 3;
  let exactValue = web3.fromWei(wei);
  let finalValue = formatNumber(exactValue, decimalsValue);
  exactValue = thousandSeparator(exactValue);

  if (currency === 'W-GNT' || currency === 'GNT' || currency === 'SNGLS') {
    finalValue = finalValue.substr(0, finalValue.indexOf('.'));
  }

  if (showLabelExact) {
    return `<span title=${exactValue}>${finalValue}</span>`;
  }

  return finalValue;
});

Template.registerHelper('formatNumber', (value, decimals, sle) => {
  let decimalsValue = decimals;
  if (decimalsValue instanceof Spacebars.kw) {
    decimalsValue = null;
  }
  let showLabelExact = sle;
  if (showLabelExact instanceof Spacebars.kw) {
    showLabelExact = null;
  }
  decimalsValue = decimalsValue || 5;

  const exactValue = thousandSeparator(value);
  const finalValue = formatNumber(value, decimalsValue);

  if (showLabelExact) {
    return `<span title=${exactValue}>${finalValue}</span>`;
  }

  return finalValue;
});

Template.registerHelper('determineOrderType', (order, section) => {
  const baseToken = Session.get('baseToken');
  let type = '';
  if (section === 'lastTrades') {
    if (order.buyWhichToken === baseToken) {
      type = 'ask';
    } else if (order.sellWhichToken === baseToken) {
      type = 'bid';
    }
  } else if (order.buyWhichToken === baseToken) {
    type = 'bid';
  } else if (order.sellWhichToken === baseToken) {
    type = 'ask';
  }
  return type;
});

Template.registerHelper('loadingIcon', (size) => {
  const image = (size === 'large') ? 'loadingLarge' : 'loading';
  return `<img src="${image}.svg" alt="Loading..." />`;
});

Template.registerHelper('volumeSelector', () => Session.get('volumeSelector'));

Template.registerHelper('getTokenAddress', (symbol) => Contracts.getTokenAddress(symbol));

Template.registerHelper('getTokenByAddress', (address) => Contracts.getTokenByAddress(address));
