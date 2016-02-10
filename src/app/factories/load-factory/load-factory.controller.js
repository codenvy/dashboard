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
 * This class is handling the controller for the factory loading.
 * @author Ann Shumilova
 */
export class LoadFactoryCtrl {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor(cheAPI, codenvyAPI, $websocket, $scope, $route, $timeout, $mdDialog, loadFactoryService, lodash, $location) {
    this.cheAPI = cheAPI;
    this.codenvyAPI = codenvyAPI;
    this.$websocket = $websocket;
    this.$timeout = $timeout;
    this.$mdDialog = $mdDialog;
    this.$location = $location;
    this.loadFactoryService = loadFactoryService;
    this.lodash = lodash;
    this.workspaces = [];
    this.workspace = {};

    this.websocketReconnect = 50;

    angular.element('#codenvynavmenu').hide();

    this.loadFactoryService.resetLoadProgress();
    this.loadFactoryService.setLoadFactoryInProgress(true);
    this.getFactoryData($route.current.params.id);
  }

  /**
   * Retrieve factory data.
   */
  getFactoryData(factoryId) {
    this.factory = this.codenvyAPI.getFactory().getFactoryById(factoryId);

    let promise = this.codenvyAPI.getFactory().fetchFactory(factoryId);
    promise.then((factory) => {
      this.factory = factory.originFactory;

      //Check factory contains workspace config:
      if (!this.factory.workspace) {
        this.getLoadingSteps()[this.getCurrentProgressStep()].hasError = true;
        this.getLoadingSteps()[this.getCurrentProgressStep()].logs = 'Factory has no workspace config.';
      } else {
        this.fetchWorkspaces();
      }
    }, (error) => {
      this.handleError(error);
    });
  }

  handleError(error) {
    if (error.data.message) {
      this.getLoadingSteps()[this.getCurrentProgressStep()].logs = error.data.message;
    }
    this.getLoadingSteps()[this.getCurrentProgressStep()].hasError = true;
  }

  /**
  * Detect workspace to start: create new one or get created one.
  */
  getWorkspaceToStart() {
    let createPolicy = (this.factory.policies) ? this.factory.policies.create : 'perClick';
    var workspace = null;
    switch (createPolicy) {
      case 'perUser' :
        workspace = this.lodash.find(this.workspaces, (w) => {
          return this.factory.id === w.attributes.factoryId;
        });
        break;
      case 'perAccount' :
        //TODO when account is ready
        workspace = this.lodash.find(this.workspaces, (w) => {
          return this.factory.workspace.name === w.name;
        });
        break;
      case 'perClick' :
        break;
    }

    if (workspace) {
      this.startWorkspace(workspace);
    } else {
      this.createWorkspace();
    }
  }

  fetchWorkspaces() {
    this.loadFactoryService.goToNextStep();

    let promise = this.cheAPI.getWorkspace().fetchWorkspaces();
    promise.then(() => {
      this.workspaces = this.cheAPI.getWorkspace().getWorkspaces();
      this.getWorkspaceToStart();
    }, () => {
      this.workspaces = this.cheAPI.getWorkspace().getWorkspaces();
      this.getWorkspaceToStart();
    });
  }

  /**
   * Create workspace from factory config.
   */
  createWorkspace() {
    let workspace = this.factory.workspace;
    //set factory attribute:
    workspace.attributes.factoryId = this.factory.id;
    workspace.name = this.getWorkspaceName(workspace.name);

    //TODO: fix account when ready:
    let creationPromise = this.cheAPI.getWorkspace().createWorkspaceFromConfig(null, workspace);
    creationPromise.then((data) => {
      this.$timeout(() => {this.startWorkspace(data); }, 1000);
    }, (error) => {
      this.handleError(error);
    });
  }

  /**
   * Get workspace name by detecting the existing names
   * and generate new name if necessary.
   */
  getWorkspaceName(name) {
    if (this.workspaces.size === 0) {
      return name;
    }

    let existingNames = this.lodash.pluck(this.workspaces, 'name');
    if (existingNames.indexOf(name) < 0) {
      return name;
    }

    let generatedName = name;
    let counter = 1;
    while (existingNames.indexOf(generatedName) >= 0) {
      generatedName = name + '_' + counter++;
    }
    return generatedName;
  }

  /**
   * Start workspace.
   */
  startWorkspace(workspace) {
    this.workspace = workspace;
    var bus = this.cheAPI.getWebsocket().getBus(workspace.id);

    if (workspace.status === 'RUNNING') {
      this.loadFactoryService.setCurrentProgressStep(4);
      this.importProjects(bus);
      return;
    }

    this.loadFactoryService.goToNextStep();
    let startWorkspacePromise = this.cheAPI.getWorkspace().startWorkspace(workspace.id, workspace.defaultEnvName);

    this.subscribeOnEvents(workspace, bus);
    startWorkspacePromise.then((data) => {
      console.log('Workspace started', data);
    });
  }

  subscribeOnEvents(data, bus){
    // get channels
    let environments = data.environments;
    let envName = data.defaultEnv;
    let defaultEnvironment = this.lodash.find(environments, (environment) => {
        return environment.name === envName;
    });

    let channels = defaultEnvironment.machineConfigs[0].channels;
    let statusChannel = channels.status;
    let outputChannel = channels.output;
    let agentChannel = 'workspace:' + data.id + ':ext-server:output';

    let workspaceId = data.id;

      // for now, display log of status channel in case of errors
    bus.subscribe(statusChannel, (message) => {
        if (message.eventType === 'DESTROYED' && message.workspaceId === data.id) {
        this.getLoadingSteps()[this.getCurrentProgressStep()].hasError = true;

        // need to show the error
        this.$mdDialog.show(
          this.$mdDialog.alert()
            .title('Unable to start workspace')
            .content('Unable to start workspace. It may be linked to OutOfMemory or the container has been destroyed')
            .ariaLabel('Workspace start')
            .ok('OK')
        );
      }
      if (message.eventType === 'ERROR' && message.workspaceId === data.id) {
        this.getLoadingSteps()[this.getCurrentProgressStep()].hasError = true;
        // need to show the error
        this.$mdDialog.show(
          this.$mdDialog.alert()
            .title('Error when starting workspace')
            .content('Unable to start workspace. Error when trying to start the workspace: ' + message.error)
            .ariaLabel('Workspace start')
            .ok('OK')
        );
      }
      console.log('Status channel of workspaceID', workspaceId, message);
    });

    // subscribe to workspace events
    bus.subscribe('workspace:' + workspaceId, (message) => {
      if (message.eventType === 'RUNNING' && message.workspaceId === workspaceId) {
      this.loadFactoryService.setCurrentProgressStep(4);
      this.importProjects(bus);
    }
    });

    bus.subscribe(agentChannel, (message) => {
      let agentStep = 3;
    if (this.loadFactoryService.getCurrentProgressStep() < agentStep) {
      this.loadFactoryService.setCurrentProgressStep(agentStep);
    }

    if (this.getLoadingSteps()[agentStep].logs.length > 0) {
      this.getLoadingSteps()[agentStep].logs = this.getLoadingSteps()[agentStep].logs + '\n' + message;
    } else {
      this.getLoadingSteps()[agentStep].logs = message;
    }
    });

    bus.subscribe(outputChannel, (message) => {
      if (this.getLoadingSteps()[this.getCurrentProgressStep()].logs.length > 0) {
      this.getLoadingSteps()[this.getCurrentProgressStep()].logs = this.getLoadingSteps()[this.getCurrentProgressStep()].logs + '\n' + message;
    } else {
      this.getLoadingSteps()[this.getCurrentProgressStep()].logs = message;
    }
    });
  }

  importProjects(bus) {
    let promise = this.cheAPI.getProject().fetchProjectsForWorkspaceId(this.workspace.id);
    promise.then(() => {
      this.detectProjectsToImport(this.cheAPI.getProject().getProjectsByWorkspace()[this.workspace.id], bus);
    }, (error) => {
      if (error.status !== 304) {
        this.detectProjectsToImport(this.cheAPI.getProject().getProjectsByWorkspace()[this.workspace.id], bus);
      } else {
        this.handleError(error);
      }
    });
  }

  /**
   * Detect projects to import by their existence on file system.
   */
  detectProjectsToImport(projects, bus) {
    this.projectsToImport = 0;

    projects.forEach((project) => {
      if (!this.isProjectOnFileSystem(project)) {
        this.projectsToImport++;
        this.importProject(this.workspace.id, project, bus);
      }
    });

    if (this.projectsToImport === 0) {
      this.finish();
    }
  }

  /**
   * Project is on file system if there is no errors except code=9.
   */
  isProjectOnFileSystem(project) {
    let problems = project.problems;
    if (!problems || problems.length === 0) {
      return true;
    }

    for (var i = 0; i < problems.length; i++) {
      if (problems[i].code === 9) {
        return true;
      }
    }

    return false;
  }

  /**
   * Perform import project
   */
  importProject(workspaceId, project, bus) {
    var promise;
  // websocket channel
    var channel = 'importProject:output:' + workspaceId + ':' + project.name;

    // on import
    bus.subscribe(channel, (message) => {
      this.getLoadingSteps()[this.getCurrentProgressStep()].logs = message.line;
    });

    promise = this.cheAPI.getProject().importProject(workspaceId, project.name, project.source);

    // needs to update configuration of the project
    promise = promise.then(() => {
      this.cheAPI.getProject().updateProject(workspaceId, project.name, project).$promise;
    }, (error) => {
      this.handleError(error);
    });

    promise.then(() => {
      this.projectsToImport--;
      if (this.projectsToImport === 0) {
        this.finish();
      }
      bus.unsubscribe(channel);
    }, (error) => {
      bus.unsubscribe(channel);
      this.handleError(error);

      // need to show the error
      this.$mdDialog.show(
        this.$mdDialog.alert()
          .title('Error while importing project')
          .content(error.statusText + ': ' + error.data.message)
          .ariaLabel('Import project')
          .ok('OK')
      );
    });
  }

  finish() {
    this.loadFactoryService.goToNextStep();
    this.$location.path(this.getIDELink());
  }

  getWorkspace() {
    return this.workspace.name;
  }

  getStepText(stepNumber) {
    return this.loadFactoryService.getStepText(stepNumber);
  }

  getLoadingSteps() {
    return this.loadFactoryService.getFactoryLoadingSteps();
  }

  getCurrentProgressStep() {
    return this.loadFactoryService.getCurrentProgressStep();
  }

  isLoadFactoryInProgress() {
    return this.loadFactoryService.isLoadFactoryInProgress();
  }

  setLoadFactoryInProgress() {
    this.loadFactoryService.setFactoryLoadInProgress(true);
  }

  resetLoadFactoryInProgress() {
    this.loadFactoryService.resetLoadProgress();
  }

  getIDELink() {
    let link = '/ide/' + this.getWorkspace();

    if (this.factory.ide && this.factory.ide.onProjectsLoaded && this.factory.ide.onProjectsLoaded.actions) {
      let actions = this.factory.ide.onProjectsLoaded.actions;
      let ideAction = '';
      actions.forEach((action) => {
        ideAction = ideAction + 'action=' + action.id;
        if (action.properties && action.properties.length > 0) {
          let params = '';
          action.properties.forEach((value, key) => {
            params = params + key + '=' + value + ';';
          });
          ideAction = ideAction + ':' + params + '&'
        }
      });
      link = link + '?' + ideAction;
    }
    return link;
  }
}
