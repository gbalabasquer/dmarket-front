import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { web3 } from 'meteor/contracts:contracts';

import Tokens from '/imports/api/tokens';

import './accountselector.html';

Template.accountSelector.helpers({
  accounts() {
    return Session.get('accounts');
  },
  currentAccount() {
    return Session.get('address');
  },
});

Template.accountSelector.events({
  change(event) {
    Session.set('address', event.target.value);
    localStorage.setItem('address', event.target.value);
    web3.eth.defaultAccount = event.target.value;
    Tokens.sync();
  },
});
