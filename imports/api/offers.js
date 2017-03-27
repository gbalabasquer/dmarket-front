import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import abi from 'ethereumjs-abi';
import ethUtil from 'ethereumjs-util';
import { Contracts } from 'meteor/contracts:contracts';

export const Offers = new Mongo.Collection('offers');

Meteor.methods({
  'offers.insert'(uuid, sellingToken, buyingToken, sellingQuantity, buyingQuantity, price, expiration, signature, owner, network) {
    // check(text, String);
 
    // Make sure the user is logged in before inserting a offer
    /*if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }*/

    //Recheck tokens are valid
    // console.log(Contracts.getTokens());
    // console.log(baseToken);

    //Recheck signature is valid
    const hash = abi.soliditySHA3(
      [ 'string', 'address', 'address', 'uint', 'uint', 'uint' ],
      [ uuid, sellingToken, buyingToken, sellingQuantity, (new BigNumber(price)).times((new BigNumber(10)).pow(18)).valueOf(), expiration ]
      ).toString('hex');
    const message = ethUtil.toBuffer(`0x${hash}`);
    const msgHash = ethUtil.hashPersonalMessage(message);

    const publicKey = ethUtil.ecrecover(msgHash, signature.v, signature.r, signature.s);
    const sender = ethUtil.publicToAddress(publicKey);
    const senderHex = ethUtil.bufferToHex(sender);
    if (senderHex !== owner) {
      return false;
    }
    //

    Offers.insert({
      uuid,
      sellingToken,
      buyingToken,
      sellingQuantity,
      buyingQuantity,
      price,
      expiration,
      created: new Date(),
      signature,
      owner,
      network,
    });
  },
  'offers.remove'(offerId) {
    check(offerId, String);
 
    Offers.remove(offerId);
  },
});