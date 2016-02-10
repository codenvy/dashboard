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
 * @name logout.controller:LogoutCtrl
 * @description This class is handling the controller of the logout
 * @author Florent Benoit
 */
export class LogoutCtrl {


  /**
   * Default constructor
   * @ngInject for Dependency injection
   */
  constructor($resource, $cookies, $window) {
    this.$resource = $resource;
    this.$cookies = $cookies;
    this.$window = $window;
    this.logoutAPI = this.$resource('/api/auth/logout', {});

  }

  /**
   * Logout current user
   */
  logout() {
    let data = {token: this.$cookies['session-access-key']};
    let promise = this.logoutAPI.save(data).$promise;
    promise.then(() => {
      this.$window.location.href = '/site/login';
    });

  }



}
