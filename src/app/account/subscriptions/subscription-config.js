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

import {SubscriptionCtrl} from '../subscriptions/subscription.controller';
import {SubscriptionProposal} from '../subscriptions/subscription-proposal.directive';
import {OnpremSubscriptionInfo} from '../subscriptions/onprem-subscription-info.directive';
import {SaasSubscriptionInfo} from '../subscriptions/saas-subscription-info.directive';

export class SubscriptionConfig {

  constructor(register) {
    register.directive('subscriptionProposal', SubscriptionProposal);
    register.directive('onpremSubscriptionInfo', OnpremSubscriptionInfo);
    register.directive('saasSubscriptionInfo', SaasSubscriptionInfo);
    register.controller('SubscriptionCtrl', SubscriptionCtrl);


    // config routes
    register.app.config(function ($routeProvider) {
      $routeProvider.accessWhen('/subscriptions', {
        templateUrl: 'app/navbar/subscriptions/subscription.html',
        controller: 'SubscriptionCtrl',
        controllerAs: 'subscriptionCtrl',
        resolve: {
          check: ['$q', 'cheService', function ($q, cheService) {
            var defer = $q.defer();
            cheService.fetchServices().then(() => {
              if (cheService.isServiceAvailable('subscription')) {
                defer.resolve();
              } else {
                defer.reject();
              }
            });
            return defer.promise;
          }]
        }
      });
    });
  }
}
