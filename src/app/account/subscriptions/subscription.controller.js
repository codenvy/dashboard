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

import {subscriptionOffers, subscriptionDetails} from '../subscriptions/subscription-data';

export class SubscriptionCtrl {
  /**
   * Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor (codenvyAPI, $location, $window, lodash) {
      this.codenvyAPI = codenvyAPI;
      this.$location = $location;
      this.$window = $window;
      this.lodash = lodash;
      this.proposals = [];

      if (this.codenvyAPI.getAccount().getAccounts().length > 0) {
        this.fetchSubscriptions();
      } else {
        this.codenvyAPI.getAccount().fetchAccounts().then(() => {
          this.fetchSubscriptions();
        });
      }
  }

  fetchSubscriptions() {
    let currentAccount = this.codenvyAPI.getAccount().getCurrentAccount();
    this.codenvyAPI.getAccount().fetchSubscriptions(currentAccount.id).then(() => {
      this.processSubscriptions(this.codenvyAPI.getAccount().getSubscriptions(currentAccount.id));
    }, (error) => {
      if (error.status === 304) {
        this.processSubscriptions(this.codenvyAPI.getAccount().getSubscriptions(currentAccount.id));
      }
    });
  }

  /**
   * Checks the list of subscriptions, if subscription exists - prepares it's display info,
   * if not adds new proposals. There two types of subscriptions : on-premises and saas(pay-as-you-go).
  */
  processSubscriptions(subscriptions) {
    this.saasSubscription = null;
    this.onPremSubscription = null;

    let services = this.lodash.pluck(subscriptions, 'serviceId');
    let hasOnPremises = services.indexOf(this.codenvyAPI.getAccount().getOnPremServiceId()) >= 0;
    let saasServiceId = this.codenvyAPI.getAccount().getSaasServiceId();
    let onPremServiceId = this.codenvyAPI.getAccount().getOnPremServiceId();

    this.saasSubscription = this.lodash.find(subscriptions, function (subscription) {
      return subscription.serviceId === saasServiceId;
    });

    this.onPremSubscription = this.lodash.find(subscriptions, function (subscription) {
      return subscription.serviceId === onPremServiceId;
    });

    if (this.saasSubscription) {
      this.getProvidedResources();
    } else {
      this.proposals.push(this.getPayAsYouGoProposal());
    }

    if (hasOnPremises) {
      this.fillOnPremDetails(this.onPremSubscription);

    } else {
      this.proposals.push(this.getOnPremProposal());
    }
  }

  getProvidedResources() {
    let currentAccount = this.codenvyAPI.getAccount().getCurrentAccount();
    this.codenvyAPI.getSaas().fetchProvidedResources(currentAccount.id).then(() => {
      this.providedResources = this.codenvyAPI.getSaas().getProvidedResources(currentAccount.id);
      if (this.saasSubscription.planId === this.codenvyAPI.getAccount().getPayAsYouGoPlanId()) {
        this.fillPayAsYouGoDetails(this.saasSubscription);
      } else if (this.saasSubscription.planId === this.codenvyAPI.getAccount().getPrepaidPlanId()) {
        this.fillPrePaidDetails(this.saasSubscription);
      }
    });
  }

  fillPayAsYouGoDetails(saasSubscription) {
    var ctrl = this;

    let details = this.lodash.find(subscriptionDetails, function (detail) {
      return detail.type === 'pay-as-you-go';
    });

    saasSubscription.title = details.title;
    saasSubscription.buttonTitle = details.buttonTitle;
    saasSubscription.cancel = function() {
      ctrl.cancelPayAsYouGo(ctrl.$location);
    };

    saasSubscription.attributes = [];
    saasSubscription.attributes.push({title : 'Free GBH', value : this.providedResources.freeAmount + ' GB hours/month'});
    saasSubscription.attributes.push({title : 'Billing Rate', value : '$' + 0 + '/GB hour'});
    saasSubscription.attributes.push({title : 'Activation Date', value : saasSubscription.startDate });
    saasSubscription.attributes.push({title : 'Next Renewal', value : saasSubscription.endDate });
  }

  fillPrePaidDetails(prepaidSubscription) {
    var ctrl = this;
    let details = this.lodash.find(subscriptionDetails, function (detail) {
      return detail.type === 'prepaid';
    });

    prepaidSubscription.title = details.title;
    prepaidSubscription.buttonTitle = details.buttonTitle;
    prepaidSubscription.cancel = function() {
      ctrl.cancelPrePaid(ctrl.$window);
    };

    prepaidSubscription.attributes = [];
    prepaidSubscription.attributes.push({title : 'Prepaid GBH', value : this.providedResources.prepaidAmount + ' GB hours/month'});
    prepaidSubscription.attributes.push({title : 'Free GBH', value : this.providedResources.freeAmount + ' GB hours/month'});
    prepaidSubscription.attributes.push({title : 'Overage GBH rate', value : '$' + 0 + '/GB hour'});
    prepaidSubscription.attributes.push({title : 'Activation Date', value : prepaidSubscription.startDate });
    prepaidSubscription.attributes.push({title : 'Next Renewal', value : prepaidSubscription.endDate });
  }

  fillOnPremDetails(onPremSubscription) {
    var ctrl = this;
    let details = this.lodash.find(subscriptionDetails, function (detail) {
      return detail.type === 'on-prem';
    });

    onPremSubscription.title = details.title;
    onPremSubscription.cancel = function() {
      ctrl.cancelOnPrem(ctrl.$window);
    };

    onPremSubscription.attributes = [];
    onPremSubscription.attributes.push({title : 'Expiring Date', value : onPremSubscription.endDate });
  }

  getPayAsYouGoProposal() {
    var ctrl = this;
    let payAsYouGoOffer = this.lodash.find(subscriptionOffers, function (offer) {
      return offer.type === 'pay-as-you-go';
    });

    payAsYouGoOffer.buy = function() {
        ctrl.onPayAsYouGoChoosen(ctrl.$location);
      };
    return payAsYouGoOffer;
   }

  onPayAsYouGoChoosen($location) {
    $location.path('account/billing');
  }

  onPremChoosen($window) {
    $window.open('https://codenvy.com/products/onprem', '_blank');
  }

  onLearnMore($window) {
    $window.open('http://pages.codenvy.com/contact.html', '_blank');
  }

  cancelPayAsYouGo(location) {
    location.path('account/billing');
  }

  cancelPrePaid($window) {
    $window.location.href =  'mailto:sales@codenvy.com?subject=' + encodeURIComponent('Cancellation of Pre-Paid Subscription');
  }

  cancelOnPrem($window) {
    $window.location.href =  'mailto:sales@codenvy.com?subject=' + encodeURIComponent('Cancellation of On-Prem Subscription');
  }


  getOnPremProposal() {
    var ctrl = this;
    let onPremOffer = this.lodash.find(subscriptionOffers, function (offer) {
      return offer.type === 'on-prem';
    });
    onPremOffer.buy = function() {
      ctrl.onPremChoosen(ctrl.$window);
    };

    onPremOffer.additionalButtonClick = function() {
      ctrl.onLearnMore(ctrl.$window);
    };
    return onPremOffer;
  }
}
