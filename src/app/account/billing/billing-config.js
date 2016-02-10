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

import {BillingCtrl} from '../billing/billing.controller';
import {BalanceSimple} from '../billing/balance-simple.directive';
import {BalanceExtended} from '../billing/balance-extended.directive';

export class BillingConfig {

  constructor(register) {
    register.controller('BillingCtrl', BillingCtrl);
    register.directive('balanceSimple', BalanceSimple);
    register.directive('balanceExtended', BalanceExtended);

    // config routes
    register.app.config(function ($routeProvider) {
      $routeProvider.accessWhen('/billing', {
          templateUrl: 'app/navbar/billing/billing.html',
          controller: 'BillingCtrl',
          controllerAs: 'billingCtrl',
          resolve: {
            check: ['$q', 'cheService', function ($q, cheService) {
              var defer = $q.defer();
              cheService.fetchServices().then(() => {
                if (cheService.isServiceAvailable('saas')) {
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
