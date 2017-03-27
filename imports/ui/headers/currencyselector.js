import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import Tokens from '/imports/api/tokens';

import './currencyselector.html';

Template.currencySelector.viewmodel({
  autorun() {
    this.quoteToken(Session.get('quoteToken'));
    this.baseToken(Session.get('baseToken'));
  },
  quoteCurrencies: Contracts.getQuoteTokens(),
  baseCurrencies: Contracts.getBaseTokens(),
  quoteToken: '',
  baseToken: '',
  quoteHelper: '',
  baseHelper: '',
  quoteChange() {
    // XXX EIP20
    Contracts.getToken(this.quoteToken(), (error, token) => {
      if (!error) {
        token.totalSupply((callError) => {
          if (!callError) {
            this.quoteHelper('');
            localStorage.setItem('quoteToken', this.quoteToken());
            Session.set('quoteToken', this.quoteToken());
            if (this.baseToken() === this.quoteToken()) {
              this.baseHelper('Tokens are the same');
            }
            if (location.hash.indexOf('#trade') !== -1) {
              location.hash = `#trade/${this.quoteToken()}`;
            }
            Tokens.sync();
          } else {
            this.quoteHelper('Token not found');
          }
        });
      } else {
        this.quoteHelper('Token not found');
      }
    });
  },
});
