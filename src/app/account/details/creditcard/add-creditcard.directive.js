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
 * @name account.creditcard.directive:addCreditcard
 * @restrict E
 * @element
 *
 * @description
 * <add-creditcard></add-creditcard> for adding account creditcard.
 *
 * @usage
 *   <add-creditcard></add-creditcard>
 *
 * @author Ann Shumilova
 */
export class AddCreditcard {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor ($timeout) {
    this.restrict='E';
    this.templateUrl = 'app/account/details/creditcard/add-creditcard.html';
    this.controller = 'AddCreditcardCtrl';
    this.controllerAs = 'addCreditcardCtrl';

    this.bindToController = true;

    this.scope = true;
    this.$timeout = $timeout;
  }
  link($scope, element) {
    var timeout = this.$timeout;

    $scope.$watch(function () {
      return element.is(':visible');
    }, function () {
      //Check credit card is already loaded not to load it twice:
      if (element.is(':visible') && element.find('.card-wrapper').children().length === 0) {
        //Timeout is needed to wait form components also to become visible to be able to bind them:
        timeout(function () {
          $scope.addCreditcardCtrl.getCard(element);
        }, 200);
      }
    });
  }

}
