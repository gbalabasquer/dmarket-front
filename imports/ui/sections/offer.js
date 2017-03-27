import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { convertFromTokenPrecision } from '/imports/utils/conversion';
import './offer.html';

function type() {
  return Template.instance().data.type;
}

Template.offer.helpers({
  type() {
    return type();
  },
  offer() {
    const offer = {...Template.instance().data.offer};
    offer.sellingQuantity = convertFromTokenPrecision(offer.sellingQuantity, type() === 'selling' ? Session.get('quoteToken') : Session.get('baseToken'));
    offer.buyingQuantity = convertFromTokenPrecision(offer.buyingQuantity, type() === 'selling' ? Session.get('baseToken') : Session.get('quoteToken'));
    return offer;
  }
});

Template.offer.events({
  'click .delete'() {
    Meteor.call('offers.remove', event.target.id);
  },
});
