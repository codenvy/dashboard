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

import {TeamCtrl} from './team.controller';
import {TeamMembersDialogAddCtrl} from './team-members-dialog-add.controller';

export class TeamConfig {

  constructor(register) {
    register.controller('TeamCtrl', TeamCtrl);
    register.controller('TeamMembersDialogAddCtrl', TeamMembersDialogAddCtrl);

    // config routes
    register.app.config(function ($routeProvider) {
      $routeProvider.accessWhen('/team', {
        templateUrl: 'app/account/team/team.html',
        controller: 'TeamCtrl',
        controllerAs: 'teamCtrl'
      });
    });
  }
}
