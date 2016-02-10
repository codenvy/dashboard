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
 * Defines a directive for displaying simple balance info (with two values).
 * @author Ann Shumilova
 */
export class BalanceSimple {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
    constructor () {
    this.restrict = 'E';
    this.templateUrl = 'app/account/billing/balance-simple.html';
    this.replace = true;

    this.scope = {
      consumed: '@cdvyConsumed',
      consumedDescription: '@cdvyConsumedDescription',
      provided: '@cdvyProvided',
      providedDescription: '@cdvyProvidedDescription',
      layout: '@cdvyLayout',
      layoutAlign: '@cdvyLayoutAlign'
    };

  }

  link($scope, element, attrs) {
    var t = this;

    attrs.$observe('cdvyConsumed', function () {
      if ($scope.consumed && $scope.provided) {
        t.initChart($scope);
      }
    });

    attrs.$observe('cdvyProvided', function () {
      if ($scope.consumed && $scope.provided) {
        t.initChart($scope);
      }
    });

  }

  initChart($scope) {
    let available = $scope.provided - $scope.consumed;
    let consumedPercents = ($scope.consumed * 100 / $scope.provided).toFixed(0);
    let availablePercents = 100 - consumedPercents;
    $scope.config = {
      tooltips: true,
      labels: false,
      mouseover: function() {},
      mouseout: function() {},
      click: function() {},
      legend: {
        display: false,
        position: 'right'
      },
      innerRadius: '25',
      colors: ['#4e5a96', '#d4d4d4']
    };

    $scope.data = {
      data: [{
        x: 'Consumed',
        y: [$scope.consumed],
        tooltip: 'Consumed (' + consumedPercents + '%)'
      }, {
        x: 'Available',
        y: [available],
        tooltip: 'Available (' + availablePercents + '%)'
      }]
    };
    $scope.chartEnabled = true;

  }
}
