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
 * This class is handling the Saas API retrieval
 * @author Ann Shumilova
 */
export class CodenvySaas {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor ($resource) {
    // keep resource
    this.$resource = $resource;

    this.providedResourcesPerAccount = new Map();

    // remote call
    this.remoteSaasAPI = this.$resource('/api/saas', {}, {
      getProvidedResources: {method: 'GET', url: '/api/saas/resources/:accountId/provided'}
    });
  }

  getSaasServicePath() {
    return 'saas';
  }

  fetchProvidedResources(accountId) {
    let promise = this.remoteSaasAPI.getProvidedResources({accountId : accountId}).$promise;
    // check if if was OK or not
    let parsedResultPromise = promise.then((data) => {
      this.providedResourcesPerAccount.set(accountId, data);
    }, (error) => {
      if (error.status !== 304) {
        console.log(error);
      }
    });
    return parsedResultPromise;
  }

  getProvidedResources(accountId) {
    return this.providedResourcesPerAccount.get(accountId);
  }
}

