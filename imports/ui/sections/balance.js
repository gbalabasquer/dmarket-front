import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import Tokens from '/imports/api/tokens';
import { convertFromTokenPrecision } from '/imports/utils/conversion';
import './balance.html';

function symbol() {
  return Session.get(`${Template.instance().data.type}Token`)
}

Template.balance.helpers({
  symbol() {
    return symbol();
  },
  balance() {
    const token = Tokens.findOne(symbol());
    return token ? convertFromTokenPrecision(token.balance, symbol()) : '';
  },
  allowance() {
    const token = Tokens.findOne(symbol());
    return token ? convertFromTokenPrecision(token.allowance, symbol()) : '';
  },
});
