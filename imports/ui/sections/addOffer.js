import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { BigNumber } from 'meteor/ethereum:web3';
import { web3 } from 'meteor/contracts:contracts';
import abi from 'ethereumjs-abi';
import ethUtil from 'ethereumjs-util';

import { getUUID } from '/imports/utils/functions';
import { convertToTokenPrecision } from '/imports/utils/conversion';

import Tokens from '/imports/api/tokens';
import { Offers } from '/imports/api/offers';

import './addOffer.html';

function parseSignature(data, code) {
    const message = ethUtil.toBuffer(data)
    const msgHash = ethUtil.hashPersonalMessage(message)
    const signature = ethUtil.toBuffer(code)
    const sigParams = ethUtil.fromRpcSig(signature)

    const result = {};

    result.message = data;
    result.signature = code;
    result.v = sigParams.v;
    result.r = ethUtil.bufferToHex(sigParams.r);
    result.s = ethUtil.bufferToHex(sigParams.s);

    return result;
  }

function encrypt(uuid, sellingToken, buyingToken, sellingQuantity, price, expiration) {
    const p = new Promise((resolve, reject) => {
      const hash = abi.soliditySHA3(
      [ 'string', 'address', 'address', 'uint', 'uint', 'uint' ],
      [ uuid, sellingToken, buyingToken, sellingQuantity, price, expiration ]
      ).toString('hex');
      // console.log(hash);
      const from = web3.eth.accounts[0];
      const params = [from, `0x${hash}`];
      const method = 'personal_sign';

      web3.currentProvider.sendAsync({
        method,
        params,
        from,
      }, function (err, result) {
        if (err) {
          reject(err);
        } else if (result.error) {
          reject(result.error);
        } else {
          // console.log('PERSONAL SIGNED:' + JSON.stringify(result.result));
          resolve(parseSignature(`0x${hash}`, result.result));
        }
      })
    });
    return p;
  }

Template.addOffer.viewmodel({
  'inputQuantity': '',
  'otherQuantity': '',
  'price': '',
  label() {
    return Template.instance().data.type === 'selling' ? 'Selling' : 'Buying';
  },
  label2() {
    return Template.instance().data.type === 'selling' ? 'Receiving' : 'Paying';
  },
  calcQuantity(type) {
    const price = new BigNumber(this.price());
    if (type === 'selling') {
      const sellingQuantity = new BigNumber(this.inputQuantity());
      const buyingQuantity = sellingQuantity.mul(price);
      this.otherQuantity(buyingQuantity);
    } else {
      const buyingQuantity = new BigNumber(this.inputQuantity());
      const sellingQuantity = buyingQuantity.div(price);
      this.otherQuantity(sellingQuantity);
    }
  },
});


Template.addOffer.events({
  'submit'(event, templateInstance) {
    // Prevent default browser form submit
    event.preventDefault();
    // Get value from form element
    const target = event.target;
    const type = templateInstance.data.type;
    const amount = new BigNumber(target.inputQuantity.value);
    const price = new BigNumber(target.price.value);
    
    const sellingTokenSymbol = type === 'selling' ? Session.get('quoteToken') : Session.get('baseToken');
    const balance = new BigNumber(Tokens.findOne(sellingTokenSymbol).balance);
    const sellingQuantity = convertToTokenPrecision(type === 'selling' ? amount : amount.div(price), sellingTokenSymbol);
    
    if (balance.gte(sellingQuantity)) {
      const uuid = getUUID();
      const sellingToken = Contracts.getTokenAddress(sellingTokenSymbol);
      
      const buyingTokenSymbol = type === 'selling' ? Session.get('baseToken') : Session.get('quoteToken');
      const buyingToken = Contracts.getTokenAddress(buyingTokenSymbol);
      const buyingQuantity = convertToTokenPrecision(type === 'selling' ? amount.times(price) : amount, buyingTokenSymbol);
      
      const expiration = target.expiration.value;
      const owner = Session.get('address');
      const network = Session.get('network');

      encrypt(uuid, sellingToken, buyingToken, sellingQuantity.valueOf(), price.times((new BigNumber(10)).pow(18)).valueOf(), expiration).then((signature) => {
        // Insert a task into the collection
        Meteor.call('offers.insert', uuid, sellingToken, buyingToken, sellingQuantity.valueOf(), buyingQuantity.valueOf(), price.valueOf(), expiration, signature, owner, network);

        // Clear form
        target.inputQuantity.value = '';
        target.price.value = '';
        target.expiration.value = '';
      }, (error) => {
        console.log('Error getting signature: ', error);
      });
    } else {
      alert('Not enough balance');
    }
  },
});
