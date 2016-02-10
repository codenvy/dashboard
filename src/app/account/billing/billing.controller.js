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

export class BillingCtrl {

  /**
   * Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor (codenvyAPI, lodash, cheNotification) {
    this.codenvyAPI = codenvyAPI;
    this.cheNotification = cheNotification;
    this.lodash = lodash;
    this.providedResources = {};
    this.isFreeAccount = false;
    this.payAsYouGo = false;

    this.invoices = [];

    if (this.codenvyAPI.getAccount().getAccounts().length > 0) {
      this.fetchSubscriptions();
      this.fetchInvoices();
    } else {
      this.codenvyAPI.getAccount().fetchAccounts().then(() => {
        this.fetchInvoices();
        this.fetchSubscriptions();
      });
    }

   this.detectCurrentMonthPeriod();

  }

  fetchSubscriptions() {
    let currentAccount = this.codenvyAPI.getAccount().getCurrentAccount();
    this.codenvyAPI.getAccount().fetchSubscriptions(currentAccount.id).then(() => {
      this.processSubscriptions();
    }, (error) => {
      if (error.status === 304) {
        this.processSubscriptions();
      }
    });
  }

  processSubscriptions() {
    let currentAccount = this.codenvyAPI.getAccount().getCurrentAccount();
    this.isFreeAccount = this.codenvyAPI.getAccount().getSubscriptions(currentAccount.id).length === 0;
    let plans = this.lodash.pluck(this.codenvyAPI.getAccount().getSubscriptions(currentAccount.id), 'planId');
    this.isPayAsYouGo = plans.indexOf(this.codenvyAPI.getAccount().getPayAsYouGoPlanId()) >= 0;
    this.detectUsage();
  }

  fetchInvoices() {
    let currentAccount = this.codenvyAPI.getAccount().getCurrentAccount();
    this.codenvyAPI.getPayment().fetchInvoices(currentAccount.id).then(() => {
      this.processInvoices(this.codenvyAPI.getPayment().getInvoices(currentAccount.id));
    }, (error) => {
      if (error.status === 304) {
        this.processInvoices(this.codenvyAPI.getPayment().getInvoices(currentAccount.id));
      } else {
        this.cheNotification.showError(error.data.message !== null ? error.data.message : 'Failed to load invoices.');
      }
    });
  }

  detectCurrentMonthPeriod() {
    let currentDate = new Date();
    //Last day of the month is detected by increasing a month and taking last day of the previous month.
    // Note - Tested with Dec.(last month) - it works ok (year will be increased, but year is need only for Feb.)
    let lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    this.startPeriod = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endPeriod = new Date(currentDate.getFullYear(), currentDate.getMonth(), lastDayOfMonth);
  }

  detectUsage() {
    let currentAccount = this.codenvyAPI.getAccount().getCurrentAccount();
    this.usedGBH = 0;
    this.chargedGBH = 0;

    this.codenvyAPI.getAccount().fetchUsedResources(currentAccount.id).then(() => {
      let resources = this.codenvyAPI.getAccount().getUsedResources(currentAccount.id);
      this.usedGBH = this.countUsedGBH(resources);
      this.getProvided(currentAccount);
    });
  }

  getProvided(account) {
    this.codenvyAPI.getSaas().fetchProvidedResources(account.id).then(() => {
      this.providedResources = this.codenvyAPI.getSaas().getProvidedResources(account.id);
      let providedSum = this.providedResources.freeAmount + this.providedResources.prepaidAmount;
      this.chargedGBH = (providedSum > this.usedGBH) ? 0 : this.usedGBH - providedSum;
    });
  }

  countUsedGBH(resources) {
    let used = this.lodash.pluck(resources, 'memory');
    let usedMb = used.reduce(function(sum, use) {
      sum += use;
      return sum;
    });
    return (usedMb).toFixed(2);
  }

  processInvoices(invoices) {
    this.invoices = invoices;
    this.invoices.forEach((invoice) => {
      var link = this.lodash.find(invoice.links, function(link) {
        return link.rel === 'html view';
      });
      if (link) {
        invoice.htmlLink = link.href;
      }
    });
  }
}
