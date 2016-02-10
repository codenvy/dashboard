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
 * Controller for delete a factory.
 * @author Oleksii Orel
 */
export class DeleteFactoryCtrl {

  /**
   * Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor($mdDialog, $location, codenvyAPI, cheNotification) {
    this.$mdDialog = $mdDialog;
    this.$location = $location;
    this.codenvyAPI = codenvyAPI;
    this.cheNotification = cheNotification;

  }

//Perform factory deletion.
  deleteFactory(event) {
    let confirm = this.$mdDialog.confirm()
      .title('Would you like to delete the factory ' + (this.factory.originFactory.name ? '"' + this.factory.originFactory.name + '"' : this.factory.originFactory.id + '?'))
      .content('Please confirm for the factory removal.')
      .ariaLabel('Remove factory')
      .ok('Delete it!')
      .cancel('Cancel')
      .clickOutsideToClose(true)
      .targetEvent(event);
    this.$mdDialog.show(confirm).then(() => {
      // remove it !
      let promise = this.codenvyAPI.getFactory().deleteFactoryById(this.factory.originFactory.id);
      promise.then(() => {
        this.$location.path('/factories');
      }, (error) => {
        this.cheNotification.showError(error.data.message ? error.data.message : 'Delete failed.');
        console.log('error', error);
      });
    });
  }

}
