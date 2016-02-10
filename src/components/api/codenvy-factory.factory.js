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

/* global FormData */

/**
 * This class is handling the factory retrieval
 * @author Florent Benoit
 */
export class CodenvyFactory {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor($resource, $q, cheUser, lodash, codenvyAnalytics) {
    // keep resource
    this.$resource = $resource;
    this.$q = $q;

    this.cheUser = cheUser;
    this.lodash = lodash;
    this.codenvyAnalytics = codenvyAnalytics;

    this.factories = [];
    this.factoriesById = new Map();
    this.factoryContentsByWorkspaceId = new Map();

    // remote calls
    this.remoteFactoryFindAPI = this.$resource('/api/factory/find');
    this.remoteFactoryAPI = this.$resource('/api/factory/:factoryId', {factoryId: '@id'}, {
      put: {method: 'PUT', url: '/api/factory/:factoryId'},
      getFactoryContentFromWorkspace: {method: 'GET', url: '/api/factory/workspace/:workspaceId'},
      createFactoryByContent: {
        method: 'POST',
        url: '/api/factory',
        isArray: false,
        headers: {'Content-Type': undefined},
        transformRequest: angular.identity
      }
    });

    // get the Codenvy user.
    let promise = this.cheUser.fetchUser();
    promise.then(() => {
      this.user = this.cheUser.getUser();
    });

  }

  /**
   * Gets the factory service path.
   * @returns {string}
   */
  getFactoryServicePath() {
    return 'factory';
  }

  /**
   * Ask for loading the factory content in asynchronous way
   * If there are no changes, it's not updated
   * @param workspace
   * @returns {*} the promise
   */
  fetchFactoryContentFromWorkspace(workspace) {
    var deferred = this.$q.defer();

    let factoryContent = this.factoryContentsByWorkspaceId.get(workspace.id);
    if (factoryContent) {
      deferred.resolve(factoryContent);
    }

    let promise = this.remoteFactoryAPI.getFactoryContentFromWorkspace({
      workspaceId: workspace.id
    }).$promise;

    promise.then((factoryContent) => {
      //update factoryContents map
      this.factoryContentsByWorkspaceId.set(workspace.id, factoryContent);
      deferred.resolve(factoryContent);
    }, (error) => {
      if (error.status === 304) {
        let findFactoryContent = this.factoryContentsByWorkspaceId.get(workspace.id);
        deferred.resolve(findFactoryContent);
      } else {
        deferred.reject(error);
      }
    });

    return deferred.promise;
  }

  /**
   * Get factory from project
   * @param workspace
   * @return the factory content
   * @returns factoryContent
   */
  getFactoryContentFromWorkspace(workspace) {
    return this.factoryContentsByWorkspaceId.get(workspace.workspaceId);
  }

  /**
   * Create factory by content
   * @param factoryContent  the factory content
   * @returns {*} the promise
   */
  createFactoryByContent(factoryContent) {

    var formDataObject = new FormData();
    formDataObject.append('factory', factoryContent);

    return this.remoteFactoryAPI.createFactoryByContent({}, formDataObject).$promise;
  }

  /**
   * Gets the factories of the current user
   * @returns {Array}
   */
  getFactories() {
    return this.factories;
  }

  /**
   * Gets the factories of the current user
   * @returns {Map}
   */
  getFactoriesMap() {
    return this.factoriesById;
  }

  /**
   * Ask for loading the factory in asynchronous way
   * If there are no changes, it's not updated
   * @param factoryId the factory ID
   * @returns {*} the promise
   */
  fetchFactory(factoryId) {
    var deferred = this.$q.defer();

    let promise = this.remoteFactoryAPI.get({factoryId: factoryId}).$promise;
    promise.then((tmpFactory) => {
      if (!tmpFactory) {
        deferred.resolve(tmpFactory);
        return;
      }

      let seeLink = [];
      this.lodash.find(tmpFactory.links, function (link) {
        if (link.rel === 'accept' || link.rel === 'accept-named') {
          seeLink.push(link.href);
        }
      });

      //set default fields
      if (!tmpFactory.name) {
        tmpFactory.name = '';
      }

      let findFactory = this.factoriesById.get(factoryId);
      let factory = {
        originFactory: tmpFactory,
        idURL: seeLink[0],
        nameURL: seeLink[1],
        views: findFactory && findFactory.views ? findFactory.views : 0
      };

      //update factories map
      this.factoriesById.set(factoryId, factory);
      //update factories array
      this.factories.length = 0;
      this.factoriesById.forEach((value) => {
        this.factories.push(value);
      });

      let viewsPromise = this.codenvyAnalytics.getFactoryUsedFromId(tmpFactory.id);

      viewsPromise.then((factoryUsed) => {
        factory.views = parseInt(factoryUsed.value);
        deferred.resolve(factory);
      }, (error) => {
        if (error.status === 304) {
          deferred.resolve(factory);
        } else {
          deferred.reject(error);
        }
      });
    }, (error) => {
      if (error.status === 304) {
        let findFactory = this.factoriesById.get(factoryId);
        if (findFactory) {
          let viewsPromise = this.codenvyAnalytics.getFactoryUsedFromId(factoryId);
          viewsPromise.then((factoryUsed) => {
            findFactory.views = parseInt(factoryUsed.value);
          });
        }
        deferred.resolve(findFactory);
      } else {
        deferred.reject(error);
      }
    });
    return deferred.promise;
  }

  /**
   * Get the factory from factoryMap by factoryId
   * @param factoryId the factory ID
   * @returns factory
   */
  getFactoryById(factoryId) {
    return this.factoriesById.get(factoryId);
  }

  /**
   * Set the factory
   * @param originFactory
   * @returns {*} the promise
   */
  setFactory(originFactory) {
    var deferred = this.$q.defer();

    let promise = this.remoteFactoryAPI.put({factoryId: originFactory.id}, originFactory).$promise;

    // check if was OK or not
    promise.then(() => {
      let factory = this.factoriesById.get(originFactory.id);
      if (factory) {
        factory.originFactory = originFactory;

        //update factories map
        this.factoriesById.set(originFactory.id, factory);//set factory
        //update factories array
        this.factories.length = 0;
        this.factoriesById.forEach((value)=> {
          this.factories.push(value);
        });

      } else {
        this.fetchFactory(originFactory.id);
      }
      deferred.resolve();
    }, (error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  /**
   * Set the factory content by factoryId
   * @param factoryId  the factory ID
   * @param factoryContent  the factory content
   * @returns {*} the promise
   */
  setFactoryContent(factoryId, factoryContent) {
    var deferred = this.$q.defer();

    let promise = this.remoteFactoryAPI.put({factoryId: factoryId}, factoryContent).$promise;

    // check if was OK or not
    promise.then(() => {

      let fetchFactoryPromise = this.fetchFactory(factoryId);

      fetchFactoryPromise.then((factory) => {
        deferred.resolve(factory);
      }, (error) => {
        deferred.reject(error);
      });
    }, (error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  /**
   * Performs factory deleting by the given factoryId.
   * @param factoryId the factory ID
   * @returns {*} the promise
   */
  deleteFactoryById(factoryId) {
    var deferred = this.$q.defer();

    let promise = this.remoteFactoryAPI.delete({factoryId: factoryId}).$promise;

    // check if was OK or not
    promise.then(() => {

      //update factories map
      this.factoriesById.delete(factoryId);//remove factory
      //update factories array
      this.factories.length = 0;
      this.factoriesById.forEach((value)=> {
        this.factories.push(value);
      });

      deferred.resolve();
    }, (error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  /**
   * Helper method that extract the factory ID from a factory URL
   * @param factoryURL the factory URL to analyze
   * @returns the stringified ID of a factory
   */
  getIDFromFactoryAPIURL(factoryURL) {
    let index = factoryURL.lastIndexOf('/factory/');
    if (index > 0) {
      return factoryURL.slice(index + '/factory/'.length, factoryURL.length);
    }
  }


  /**
   * Ask for loading the factories in asynchronous way
   * If there are no changes, it's not updated
   */
  fetchFactories(maxItems, skipCount) {
    var promises = [];

    // use of the user ID
    var userId = this.user.id;

    // find the factories
    let factoriesPromise = this.remoteFactoryFindAPI.query(
      {'creator.userId': userId, 'maxItems': maxItems, 'skipCount': skipCount}).$promise;

    // when find is there we can ask for each factory
    factoriesPromise.then((remoteFactories) => {

      // Gets factory resource based on the factory ID
      remoteFactories.forEach((factory) => {
        // there is a factory ID, so we can ask the factory details
        if (factory.id) {
          let tmpFactoryPromise = this.fetchFactory(factory.id);
          promises.push(tmpFactoryPromise);
        }
      });
    });
    return this.$q.all(promises);
  }

}
