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
 * Controller for a factory routing.
 * @author Oleksii Orel
 */
export class FactoryRoutingCtrl {

  /**
   * Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor($scope, codenvyAPI, cheNotification) {
    this.$scope = $scope;
    this.codenvyAPI = codenvyAPI;
    this.cheNotification = cheNotification;

    //set default value for factory workspace.
    $scope.$watch('factoryRoutingCtrl.factory.originFactory.workspace', function (newWorkspace) {
      $scope.workspace = {
        type: newWorkspace && newWorkspace.type ? newWorkspace.type : 'named',
        location: newWorkspace && newWorkspace.location ? newWorkspace.location : 'acceptor'
      };
    });
  }

  //Set factory workspace.
  setFactoryWorkspace(factoryWorkspace) {
    let factory = angular.copy(this.factory.originFactory);

    factory.workspace = factoryWorkspace;

    let promise = this.codenvyAPI.getFactory().setFactory(factory);

    promise.then(() => {
      this.factory.workspace = angular.copy(factoryWorkspace);
      this.cheNotification.showInfo('Factory workspace information successfully updated.');
    }, (error) => {
      factoryWorkspace = this.factory.originFactory.workspace;
      this.cheNotification.showError(error.data.message ? error.data.message : 'Update factory failed.');
      console.log('error', error);
    });
  }

}
