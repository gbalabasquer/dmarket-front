import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Offers } from '/imports/api/offers';

import './offers.html';
window.Offers = Offers;
function type() {
  return Template.instance().data.type;
}

Template.offers.helpers({
  type() {
    return type();
  },
  offers() {
    let conditions = {};
    const baseToken = Contracts.getTokenAddress(Session.get('baseToken'));
    const quoteToken = Contracts.getTokenAddress(Session.get('quoteToken'));

    if (type() === 'mine') {
      const or = [
        { sellingToken: quoteToken, buyingToken: baseToken },
        { sellingToken: baseToken, buyingToken: quoteToken }
      ];
      const address = Session.get('address');

      conditions = { owner: address, $or: or };
      console.log(conditions);
    } else {
      const sellingToken = type() === 'selling' ? quoteToken : baseToken;
      const buyingToken = type() === 'selling' ? baseToken : quoteToken;
      conditions = { sellingToken, buyingToken };
    }
    return Offers.find(conditions, { sort: { createdAt: -1 } });
  },
});
