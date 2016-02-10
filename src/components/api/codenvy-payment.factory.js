/*
 * CODENVY CONFIDENTIAL
 * __________________
 *
 *  [2015] - [2016] Codenvy, S.A.
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Codenvy S.A. and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Codenvy S.A.
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Codenvy S.A..
 */
'use strict';


/**
 * This class is handling the credit card API.
 * @author Ann Shumilova
 */
export class CodenvyPayment {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor ($resource, $braintree, $q) {
    // keep resource
    this.$resource = $resource;
    this.$braintree = $braintree;
    this.$q = $q;

    this.creditCardsPerAccount = new Map();
    this.tokensPerAccount = new Map();
    this.invoicesPerAccount = new Map();

    // remote call
    this.remotePaymentAPI = this.$resource('/api/creditcard/:accountId',{}, {
      getToken: {method: 'GET', url: '/api/creditcard/:accountId/token'},
      add: {method: 'POST', url: '/api/creditcard/:accountId'},
      remove: {method: 'DELETE', url: '/api/creditcard/:accountId/:creditCardNumber'},
      getInvoices: {method: 'GET', url: '/api/invoice/find/?accountId=:accountId', isArray: true}
    });

  }

  getCreditCardServicePath() {
    return 'creditcard';
  }

  getInvoiceServicePath() {
    return 'invoice';
  }

  /**
   * Gets credit cards list
   */
  fetchCreditCards(accountId) {
    let promise = this.remotePaymentAPI.query({accountId: accountId}).$promise;
    // check if if was OK or not
    let parsedResultPromise = promise.then((data) => {
      this.creditCardsPerAccount.set(accountId, data);
    });
    return parsedResultPromise;
  }

  /**
   * Gets the list of credit cards by account id.
   * @returns {Array}
   */
  getCreditCards(accountId) {
    return this.creditCardsPerAccount.get(accountId);
  }

  /**
   * Gets the client token to add credit card.
   */
  getClientToken(accountId) {
    let promise = this.remotePaymentAPI.getToken({accountId: accountId}).$promise;
    // check if if was OK or not
    let parsedResultPromise = promise.then((data) => {
      this.tokensPerAccount.set(accountId, data.token);
    });
    return parsedResultPromise;
  }

  /**
   * Adds credit card data to the pointed account.
   */
  addCreditCard(accountId, creditCard) {
    var client;
    var remotePaymentAPI = this.remotePaymentAPI;
    var mainCreditCardInfo = {};
    mainCreditCardInfo.number = creditCard.number;
    mainCreditCardInfo.cardholderName = creditCard.cardholder;
    mainCreditCardInfo.expirationDate = creditCard.expires.replace(/ /g, '');
    mainCreditCardInfo.cvv = creditCard.cvv;
    mainCreditCardInfo.billingAddress = {};
    mainCreditCardInfo.billingAddress = {postalCode: creditCard.postCode};
    var defer = this.$q.defer();

    this.getClientToken(accountId).then(() => {
      client = new this.$braintree.api.Client({
        clientToken: this.tokensPerAccount.get(accountId)
      });

      client.tokenizeCard(mainCreditCardInfo, function (err, nonce) {
        var newCreditCard = {nonce: nonce};
        newCreditCard.state = creditCard.state;
        newCreditCard.country = creditCard.country;
        newCreditCard.streetAddress = creditCard.streetAddress;
        newCreditCard.city = creditCard.city;

        remotePaymentAPI.add({accountId: accountId}, newCreditCard).$promise.then(() => {
          defer.resolve();
        }, (error) => {
          defer.reject(error);
        });

      });
    });
    return defer.promise;
  }

  /**
   * Removes credit card by it's number in the pointed account.
   */
  removeCreditCard(accountId, creditCardNumber) {
    return this.remotePaymentAPI.remove({accountId: accountId, creditCardNumber: creditCardNumber}).$promise;
  }

  fetchInvoices(accountId) {
    let promise = this.remotePaymentAPI.getInvoices({accountId: accountId}).$promise;
    // check if if was OK or not
    let parsedResultPromise = promise.then((data) => {
      this.invoicesPerAccount.set(accountId, data);
    });
    return parsedResultPromise;
  }

  /**
   * Gets the list of invoices by account id.
   * @returns {Array}
   */
  getInvoices(accountId) {
    return this.invoicesPerAccount.get(accountId);
  }
}
