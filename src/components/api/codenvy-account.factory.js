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
 * This class is handling the account API retrieval
 * @author Ann Shumilova
 */
export class CodenvyAccount {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor ($resource) {
    // keep resource
    this.$resource = $resource;
    this.accounts = [];
    this.accountsById = new Map();

    this.subscriptionsPerAccount = new Map();
    this.accountDetails = new Map();
    this.accountMembers = new Map();
    this.usedResourcesPerAccount = new Map();

    // remote call
    this.remoteAccountAPI = this.$resource('/api/account', {}, {
      getByID: {method: 'GET', url: '/api/account/:accountId'},
      getSubscriptions: {method: 'GET', url: '/api/subscription/find/account?id=:accountId', isArray: true},
      getMembers: {method: 'GET', url: '/api/account/:accountId/members', isArray: true},
      addMember: {method: 'POST', url: '/api/account/:accountId/members'},
      deleteMember: {method: 'DELETE', url: '/api/account/:accountId/members/:userId'},
      addSubscription: {method: 'POST', url: '/api/subscription'},
      getUsedResources: {method: 'GET', url: '/api/resources/:accountId/used', isArray: true},
      redistributeResources: {method: 'POST', url: '/api/resources/:accountId'}
    });

    // fetch the accounts when we're initialized
    this.fetchAccounts();
  }

  getSubscriptionServicePath() {
    return 'subscription';
  }

  getSaasServiceId() {
    return 'Saas';
  }

  getOnPremServiceId() {
    return 'OnPremises';
  }

  getPayAsYouGoPlanId() {
    return 'pay-as-you-go';
  }

  getPrepaidPlanId() {
    return 'prepaid';
  }

  getAccountServicePath() {
    return 'account';
  }

  /**
   * Gets the user data
   */
  fetchAccounts() {
    let promise = this.remoteAccountAPI.query().$promise;
    this.accounts = [];
    this.accountsById.clear();
    // check if if was OK or not
    let parsedResultPromise = promise.then((data) => {
      data.forEach((membership) => {
        if (membership.roles.indexOf('account/owner') >= 0) {
          this.accounts.push(membership.accountReference);
          this.accountsById.set(membership.accountReference.id, membership.accountReference);
        }
      });
      //TODO remove this part, when switch between accounts is ready:
      if (this.accounts.length > 0) {
        this.setCurrentAccount(this.accounts[0]);
      }
    });
    return parsedResultPromise;
  }

  /**
   * Gets the accounts per id
   * @returns {Map}
   */
  getAccountsById() {
    return this.accountsById;
  }

  /**
   * Gets the accounts, where current user is owner
   * @returns {Array}
   */
  getAccounts() {
    return this.accounts;
  }

  getCurrentAccount() {
    return this.currentAccount;
  }

  setCurrentAccount(account) {
    this.currentAccount = account;
  }

  fetchAccountDetails(accountId) {
    let promise = this.remoteAccountAPI.getByID({accountId : accountId}).$promise;
    // check if if was OK or not
    let parsedResultPromise = promise.then((data) => {
      this.accountDetails.set(accountId, data);
    });
    return parsedResultPromise;
  }

  fetchAccountMembers(accountId) {
    let promise = this.remoteAccountAPI.getMembers({accountId : accountId}).$promise;
    // check if if was OK or not
    let parsedResultPromise = promise.then((data) => {
      this.accountMembers.set(accountId, data);
    }, (error) => {
      if (error.status !== 304) {
        console.log(error);
      }
    });
    return parsedResultPromise;
  }

  getAccountMembers(accountId) {
    return this.accountMembers.get(accountId);
  }

  addAccountMember(accountId, userId, roles) {
    let data = {};
    data.userId = userId;
    data.roles = roles;
    let promise = this.remoteAccountAPI.addMember({accountId : accountId}, data).$promise;
    return promise;
  }

  deleteAccountMember(accountId, userId) {
    let promise = this.remoteAccountAPI.deleteMember({accountId : accountId, userId: userId}).$promise;
    return promise;
  }

  getAccountDetails(accountId) {
    return this.accountDetails.get(accountId);
  }

  fetchSubscriptions(accountId) {
    let promise = this.remoteAccountAPI.getSubscriptions({accountId : accountId}).$promise;
    // check if if was OK or not
    let parsedResultPromise = promise.then((data) => {
      this.subscriptionsPerAccount.set(accountId, data);
    });
    return parsedResultPromise;
  }

  getSubscriptions(accountId) {
    return this.subscriptionsPerAccount.get(accountId);
  }

  addSubscription(accountId, planId, usePaymentSystem) {
    let data = {};
    data.accountId = accountId;
    data.planId = planId;
    data.usePaymentSystem = usePaymentSystem;

    return this.remoteAccountAPI.addSubscription(data).$promise;
  }

  fetchUsedResources(accountId) {
    let promise = this.remoteAccountAPI.getUsedResources({accountId : accountId}).$promise;
    // check if if was OK or not
    let parsedResultPromise = promise.then((data) => {
      this.usedResourcesPerAccount.set(accountId, data);
    }, (error) => {
      if (error.status !== 304) {
        console.log(error);
      }
    });
    return parsedResultPromise;
  }

  getUsedResources(accountId) {
    return this.usedResourcesPerAccount.get(accountId);
  }

  redistributeResources(accountId, workspaceId, resources) {
    let data = [];
    resources.workspaceId = workspaceId;
    data.push(resources);

    let promise = this.remoteAccountAPI.redistributeResources({accountId : accountId}, data).$promise;
    return promise;
  }
}
