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

import {FactoryDetailsCtrl} from '../factory-details/factory-details.controller';
import {InformationTabConfig} from './information-tab/information-tab-config';
import {ConfigurationTabConfig} from './configuration-tab/configuration-tab-config';


export class FactoryDetailsConfig {

  constructor(register) {
    register.controller('FactoryDetailsCtrl', FactoryDetailsCtrl);

    // config routes
    register.app.config(function ($routeProvider) {
      $routeProvider.accessWhen('/factory/:id', {
        templateUrl: 'app/factories/factory-details/factory-details.html',
        controller: 'FactoryDetailsCtrl',
        controllerAs: 'factoryDetailsCtrl'
      });

    });

    // config files
    new InformationTabConfig(register);
    new ConfigurationTabConfig(register);

  }
}
