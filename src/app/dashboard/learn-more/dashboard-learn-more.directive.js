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
 * @ngdoc directive
 * @name dashboard.directive:DashboardLearnMoreCtrl
 * @description This class is handling the directive of the learn-more widget to display in the dashboard
 * @author Florent Benoit
 */
export class DashboardLearnMore {


  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor() {
    this.restrict = 'E';
    this.templateUrl = 'app/dashboard/learn-more/dashboard-learn-more.html';

    this.controller = 'DashboardLearnMoreCtrl';
    this.controllerAs = 'dashboardLearnMoreCtrl';
    this.bindToController = true;
  }

}
