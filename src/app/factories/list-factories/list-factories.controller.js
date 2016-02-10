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
 * Controller for the factories.
 * @author Florent Benoit
 * @author Oleksii Orel
 */
export class ListFactoriesCtrl {

  /**
   * Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor($mdDialog, codenvyAPI, cheNotification) {
    this.$mdDialog = $mdDialog;
    this.codenvyAPI = codenvyAPI;
    this.cheNotification = cheNotification;

    this.dropDownOptionsList = [
      {
        name: 'Sort by views number', orderBy: 'views'
      }, {
        name: 'Sort by creation date', orderBy: 'originFactory.creator.created'
      }, {
        name: 'Delete all selected factories', deleteAll: 'true'
      }
    ];

    this.hasNextPage = true;

    this.maxItems = 15;
    this.skipCount = 0;

    this.factoriesOrderBy = '';

    this.factoriesFilter = {
      originFactory: {
        name: ''
      }
    };

    this.factoriesSelectedStatus = {};

    this.isLoading = true;

    this.factories = codenvyAPI.getFactory().getFactories();

    // fetch factories when initializing
    let promise = codenvyAPI.getFactory().fetchFactories(this.maxItems, this.skipCount);

    promise.then(() => {
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        if (error.status !== 304) {
          cheNotification.showError(error.data.message ? error.data.message : 'Update information failed.');
          console.log('error', error);
        }
      });
  }

  /**
   * Load more factories, coll this function on list scroll down
   */
  loadNextPage() {
    this.skipCount = this.factories.length;

    this.isLoading = true;

    let promise = this.codenvyAPI.getFactory().fetchFactories(this.maxItems, this.skipCount);

    promise.then(() => {
        this.factories = this.codenvyAPI.getFactory().getFactories();
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        if (error.status !== 304) {
          this.cheNotification.showError(error.data.message ? error.data.message : 'Update information failed.');
          console.log('error', error);
        }
      });
  }


  /**
   * Delete all selected factories
   * @param event
   */
  deleteSelectedFactories(event) {
    let factoriesSelectedStatusKeys = Object.keys(this.factoriesSelectedStatus);
    let checkedFactoriesKeys = [];
    if (factoriesSelectedStatusKeys.length) {
      var ctrl = this;
      factoriesSelectedStatusKeys.forEach(function (key) {
        if (ctrl.factoriesSelectedStatus[key] === true) {
          checkedFactoriesKeys.push(key);
        }
      });
      var queueLenth = checkedFactoriesKeys.length;
      if (queueLenth) {
        let confirmTitle = 'Would you like to delete ';
        if (queueLenth > 1) {
          confirmTitle += 'these ' + queueLenth + ' factories?';
        } else {
          confirmTitle += 'this selected factory?';
        }
        let confirm = this.$mdDialog.confirm()
          .title(confirmTitle)
          .content('Please confirm for the removal.')
          .ariaLabel('Remove selected factories')
          .ok('Delete!')
          .cancel('Cancel')
          .clickOutsideToClose(true)
          .targetEvent(event);
        this.$mdDialog.show(confirm).then(() => {
          var isError = false;
          checkedFactoriesKeys.forEach((factoryId) => {
            this.factoriesSelectedStatus[factoryId] = false;
            // remove it !
            let promise = this.codenvyAPI.getFactory().deleteFactoryById(factoryId);
            promise.then(() => {
              queueLenth--;
              if (!queueLenth) {
                if (isError) {
                  this.cheNotification.showError('Delete failed.');
                } else {
                  this.cheNotification.showInfo('Has been successfully removed.');
                }
              }
            }, (error) => {
              queueLenth--;
              if (!queueLenth) {
                this.cheNotification.showError('Delete failed.');
              }
              console.log('error', error);
            });
          });
        });
      } else {
        this.cheNotification.showError('No selected factories.');
      }
    } else {
      this.cheNotification.showError('No selected factories.');
    }
  }

  /**
   * Callback called when the dropdown is called
   * @param selected
   * @param event
   */
  dropDownSelected(selected, event) {
    if (selected.orderBy) {
      this.factoriesOrderBy = this.factoriesOrderBy === selected.orderBy ? '-' + selected.orderBy : selected.orderBy;
    } else if (selected.deleteAll) {
      this.deleteSelectedFactories(event);
    }
  }

}

