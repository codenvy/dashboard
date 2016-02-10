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
 * @ngdoc controller
 * @name account.creditcard.controller:AddCreditcardCtrl
 * @description This class is handling the controller for the adding credit card
 * @author Ann Shumilova
 */
export class AddCreditcardCtrl {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor(codenvyAPI, cheAPI, jsonCountries) {
    this.creditCard = {};
    this.values = {
      number: '•••• •••• •••• ••••',
      name: 'Full Name',
      expiry: '••/••',
      cvc: '•••'
    };

    this.messages = {
      validDate: 'valid\ndate', // optional - default 'valid\nthru'
      monthYear: 'mm/yyyy' // optional - default 'month/year'
    };

    this.options = {
      debug: false,
      formatting: true
    };

    this.countries = [];
    this.profile = cheAPI.getProfile().getProfile();

    let allCountries = angular.fromJson(jsonCountries).all;
    allCountries.forEach((country) => {
      this.countries.push({name: country.name});
    });

    //Select the country from user's profile attributes if exists:
    if (this.profile && this.profile.attributes && this.profile.attributes.country) {
      this.creditCard.country = this.profile.attributes.country;
    } else {
      //TODO remove this when bug with billingAddress NullPointerException is fixed
      this.creditCard.country = 'United States';
    }
  }

  getCard(element) {
    var cardContainer = element.find('#card-container');
    if (cardContainer && cardContainer.children().length > 0) {
      cardContainer.empty();
    }

    var card = {
      container: '#card-container',

      numberInput: 'input#cardNumber',
      expiryInput: 'input#expires',
      cvcInput: 'input#cvv',
      nameInput: 'input#cardholderName',

      width: 350,
      // Strings for translation - optional
      messages: {
        validDate: this.messages.validDate,
        monthYear: this.messages.monthYear
      },
      // Default values for rendered fields - options
      values: {
        number: this.values.number,
        name: this.values.name,
        expiry: this.values.expiry,
        cvc: this.values.cvc
      },

      formatting: this.options.formatting,
      debug: this.options.debug
    };
    $(element).card(card); // jshint ignore:line
  }
}
