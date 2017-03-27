import { Contracts } from 'meteor/contracts:contracts';
import { BigNumber } from 'meteor/ethereum:web3';

export function convertToTokenPrecision(amount, token) {
  if (typeof token !== 'undefined' && token !== '') {
    const tokenSpecs = Contracts.getTokenSpecs(token);
    if (tokenSpecs) {
      let value = amount;
      if (!(amount instanceof BigNumber)) {
        value = new BigNumber(amount);
      }
      return value.times(new BigNumber(10).pow(tokenSpecs.precision));
    }
    throw new Error('Precision not found when converting');
  }
  throw new Error('Token not found when converting');
}

export function convertFromTokenPrecision(amount, token) {
  if (typeof token !== 'undefined' && token !== '') {
    const tokenSpecs = Contracts.getTokenSpecs(token);
    if (tokenSpecs) {
      let value = amount;
      if (!(amount instanceof BigNumber)) {
        value = new BigNumber(amount);
      }
      return value.div(new BigNumber(10).pow(tokenSpecs.precision));
    }
    throw new Error('Precision not found when converting');
  }
  throw new Error('Token not found when converting');
}

export function convertTo18Precision(amount, token) {
  if (typeof token !== 'undefined' && token !== '') {
    const tokenSpecs = Contracts.getTokenSpecs(token);
    if (tokenSpecs) {
      if (tokenSpecs.precision === 18) {
        return amount;
      }
      let value = amount;
      if (!(amount instanceof BigNumber)) {
        value = new BigNumber(amount);
      }
      return value.times(new BigNumber(10).pow(18 - tokenSpecs.precision));
    }
    throw new Error('Precision not found when converting');
  }
  throw new Error('Token not found when converting');
}
