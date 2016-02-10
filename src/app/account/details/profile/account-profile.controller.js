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
 * @name account.profile.controller:AccountProfileCtrl
 * @description This class is handling the controller for the account's profile
 * @author Florent Benoit
 * @author Oleksii Orel
 */
export class AccountProfileCtrl {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor(jsonCountries) {
    'ngInject';

    this.countries = [];

    var fromJsonCountries = angular.fromJson(jsonCountries);

    var that = this;
    if (fromJsonCountries.all) {
      angular.forEach(fromJsonCountries.all, function (fromJsonCountry) {
        that.countries.push({name: fromJsonCountry.name});
      });
    }
  }
}
