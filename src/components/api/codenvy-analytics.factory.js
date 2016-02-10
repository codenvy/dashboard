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
 * This class is handling the API for sending data for Codenvy Analytics.
 * @author Ann Shumilova
 */
export class CodenvyAnalytics {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor($resource, $cookies) {
    this.$resource = $resource;
    this.$cookies = $cookies;
    // remote call
    this.remoteAnalytisAPI = this.$resource('/api/analytics/log/', {}, {
      log: {method: 'POST', url: '/api/analytics/log/dashboard-usage'},
      user_invite: {method: 'POST', url: '/api/analytics/log/user-invite'},
      factory_used: {
        method: 'GET',
        url: '/api/analytics/public-metric/factory_used?factory_id=:factoryId'
      },
      sessionUsage: {method: 'POST', url: '/api/analytics/log/session-usage'}
    });

  }

  // need to send to analytics an event
  userInviteAction(workspaceId, email) {
    let data = {params: {'WS':workspaceId, 'EMAIL': email}};
    return this.remoteAnalytisAPI.user_invite(data).$promise;
  }

  logAction(action) {
    let data = {params: {ACTION: action}};
    let promise = this.remoteAnalytisAPI.log(data).$promise;
    promise.then(() => {
    }, (error) => {
      console.log(error);
    });
  }

  /**
   * Get the factory used info for the factoryIdgulp serve
   * @param factoryId the factory Id
   * @returns {*} the promise
   */
  getFactoryUsedFromId(factoryId) {
    return this.remoteAnalytisAPI.factory_used({factoryId: factoryId}).$promise;
  }

  logSession(id) {
    let data = {
      params: {
        'SESSION-ID': id,
        'WINDOW': 'DASHBOARD'
      }
    };
    let promise = this.remoteAnalytisAPI.sessionUsage(data).$promise;
    promise.then(() => {
    }, (error) => {
      console.log(error);
    });
  }

}
