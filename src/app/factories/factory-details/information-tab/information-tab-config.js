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

import {DeleteFactoryCtrl} from '../information-tab/delete-factory/delete-factory.controller';
import {DeleteFactory} from '../information-tab/delete-factory/delete-factory.directive';
import {FactoryInformationCtrl} from '../information-tab/factory-information/factory-information.controller';
import {FactoryInformation} from '../information-tab/factory-information/factory-information.directive';
import {FactoryRoutingCtrl} from '../information-tab/factory-routing/factory-routing.controller';
import {FactoryRouting} from '../information-tab/factory-routing/factory-routing.directive';


export class InformationTabConfig {

  constructor(register) {
    register.controller('DeleteFactoryCtrl', DeleteFactoryCtrl);
    register.directive('cdvyDeleteFactory', DeleteFactory);

    register.controller('FactoryInformationCtrl', FactoryInformationCtrl);
    register.directive('cdvyFactoryInformation', FactoryInformation);

    register.controller('FactoryRoutingCtrl', FactoryRoutingCtrl);
    register.directive('cdvyFactoryRouting', FactoryRouting);

  }
}
