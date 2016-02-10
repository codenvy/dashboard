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
 * @ngdoc controller
 * @name dashboard.controller:DashboardLearnMoreCtrl
 * @description This class is handling the controller of the learn-more widget to display in the dashboard
 * @author Florent Benoit
 */
export class DashboardLearnMoreCtrl {


  /**
   * Default constructor
   * @ngInject for Dependency injection
   */
  constructor($window, $http, $location, $rootScope, cheWorkspace, cheProject, codenvyFactory, $timeout) {
    this.$window = $window;
    this.$http = $http;
    this.$location = $location;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.cheWorkspace = cheWorkspace;
    this.cheProject = cheProject;
    this.codenvyFactory = codenvyFactory;

    // check factories (to see if we need or not to enable the factories)
    //this.checkFactories();
  }


  /**
   * Try to open guided tour example on the first workspace
   */
  gettingStarted() {
    // take first workspace
    let promise = this.cheWorkspace.fetchWorkspaces();
    promise.then(() => { this.openGuidedTour();}, () => { this.openGuidedTour();});

  }

  /**
   * Open the guided tour by updating the browser location
   */
  openGuidedTour() {
    let workspaces = this.cheWorkspace.getWorkspaces();

    // take first workspace
    let workspaceId = workspaces[0].workspaceReference.id;

    // name to search (or create)
    let expectedProjectName = 'getting-started-guided-tour';

    // get current projects
    let projectsMap = this.cheProject.getProjectsByWorkspaceMap();

    // search ig guided tour is found
    let projects = projectsMap.get(workspaceId);
    let foundProject;
    projects.forEach((project) => {
      if (expectedProjectName === project.name) {
        foundProject = project;
      }
    });

    // if found, redirect to it, else create it and then redirect to it
    if (foundProject) {
      this.redirectToGuidedTour(foundProject.ideUrl);
    } else {
      // need first to create project
      let promise = this.addGuidedTourProject(workspaceId);
      promise.then(() => {

        let fetchDetailsPromise = this.cheProject.fetchProjectDetails(workspaceId, expectedProjectName);
        let getDetailsPromise = fetchDetailsPromise.then(() => {
          let details = this.cheProject.getProjectDetailsByKey(workspaceId, expectedProjectName);
          this.redirectToGuidedTour(details.ideUrl);
        });
        return getDetailsPromise;
      });
    }

  }

  /**
   * Import the guided tour project
   * @param workspaceId the workspace ID to use for importing
   * @returns {*}
   */
  addGuidedTourProject(workspaceId) {
    let promise = this.$http.get('https://dockerfiles.codenvycorp.com/guided-tour/getting-started/getting-started-factory.json');

    let dataPromise = promise.then((response) => {
      return this.cheProject.importProject(workspaceId, 'getting-started-guided-tour', response.data);
    });

    return dataPromise;

  }


  /**
   * Redirect user to the getting started project
   * @param workspaceName
   */
  redirectToGuidedTour(ideUrl) {
    this.$window.location.href = ideUrl;
    this.broadcast('getting-started', true);

  }


  /**
   * Go on create project in order to import some projects.
   */
  importFirstProjectGit() {
    this.$location.path('/create-project/github');
    this.broadcast('import-project', true);
  }

  /**
   * Go on create project in order to import some projects.
   */
  importFirstProjectZip() {
    this.$location.path('/create-project/zip');
    this.broadcast('import-project', true);
  }



  trySampleProject() {
    this.broadcast('try-samples', true);
  }

  /**
   * Check factories and check if some factories have been created
   */
  checkFactories() {

    this.codenvyFactory.fetchFactories();
    this.$timeout(() => this.analyzeFactories(), 3000);
  }


  /**
   * If there are factories, step has been completed
   */
  analyzeFactories() {
    let factories = this.codenvyFactory.getFactories();
    if (factories) {
      if (factories.length > 0) {
        this.broadcast('create-factory', true);
      } else {
        this.broadcast('create-factory', false);
      }
    }
  }

  /**
   * Broadcast to learn-more component that a given step has been completed
   * @param key
   */
  broadcast(key, value) {
    let data = {
      key: key,
      value: value
    };

    this.$rootScope.$broadcast('codenvyLearnMore:updateState', data);
  }

}
