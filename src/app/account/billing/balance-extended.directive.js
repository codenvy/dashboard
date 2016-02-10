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
 * Defines a directive for displaying extended balance info (with three values).
 * @author Ann Shumilova
 */
export class BalanceExtended {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
    constructor () {
    this.restrict = 'E';
    this.templateUrl = 'app/account/billing/balance-extended.html';
    this.replace = true;

    this.scope = {
      consumed: '@cdvyConsumed',
      consumedDescription: '@cdvyConsumedDescription',
      provided: '@cdvyProvided',
      providedDescription: '@cdvyProvidedDescription',
      charged: '@cdvyCharged',
      chargedDescription: '@cdvyChargedDescription',
      layout: '@cdvyLayout',
      layoutAlign: '@cdvyLayoutAlign'

    };

  }

  link($scope, element, attrs) {
    var t = this;

    attrs.$observe('cdvyConsumed', function () {
      if ($scope.consumed && $scope.provided && $scope.charged) {
        t.initChart($scope);
      }
    });

    attrs.$observe('cdvyProvided', function () {
      if ($scope.consumed && $scope.provided && $scope.charged) {
        t.initChart($scope);
      }
    });

    attrs.$observe('cdvyCharged', function () {
      if ($scope.consumed && $scope.provided && $scope.charged) {
        t.initChart($scope);
      }
    });
  }

  initChart($scope) {
    let isCharged = parseFloat($scope.provided) < parseFloat($scope.consumed);
    let dataX= isCharged ? $scope.provided : $scope.consumed;
    let dataY= isCharged ? $scope.charged : ($scope.provided - $scope.consumed);
    let dataXPercents = isCharged ? ($scope.provided * 100 / $scope.consumed).toFixed(0) : ($scope.consumed * 100 / $scope.provided).toFixed(0);
    let dataYPercents = 100 - dataXPercents;
    let dataXColor = isCharged ? '#3b9275' : '#4e5a96';
    let dataYColor = isCharged ? '#f17a3d' : '#3b9275';

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
      colors: [dataXColor, dataYColor]
    };

    $scope.data = {
      data: [{
        x: 'Consumed',
        y: [dataX],
        tooltip: dataXPercents + '%'
      }, {
        x: 'Available',
        y: [dataY],
        tooltip: dataYPercents +'%'
      }]
    };
    $scope.chartEnabled = true;

  }
}
