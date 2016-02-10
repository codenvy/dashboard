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
 * This class is handling the service for the factory loading.
 * @author Ann Shumilova
 */
export class LoadFactoryService {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor ($timeout, $compile) {
    this.$timeout = $timeout;
    this.$compile = $compile;
    this.init = false;


    this.loadFactoryInProgress = false;

    this.currentProgressStep = 0;


    this.loadingSteps = [
      {text: 'Load factory data', inProgressText: 'Loading factory data', logs: '', hasError: false},
      {text: 'Initialize workspace', inProgressText: 'Initializing workspace', logs: '', hasError: false},
      {text: 'Start workspace', inProgressText: 'Starting workspace', logs: '', hasError: false},
      {text: 'Start workspace agent', inProgressText: 'Starting workspace agent', logs: '', hasError: false},
      {text: 'Import project(s)', inProgressText: 'Importing project(s)', logs: '', hasError: false},
      {text: 'Project(s) imported', inProgressText: 'Opening workspace', logs: '', hasError: false}
    ];

    this.popupVisible = false;
    this.initPopup = false;
  }

  getStepText(stepNumber) {
    let entry = this.loadingSteps[stepNumber];
    if (this.currentProgressStep >= stepNumber) {
      return entry.inProgressText;
    } else {
      return entry.text;
    }
  }

  getFactoryLoadingSteps() {
    return this.loadingSteps;
  }

  setCurrentProgressStep(currentProgressStep) {
    this.currentProgressStep = currentProgressStep;
  }

  goToNextStep() {
    this.currentProgressStep++;
  }

  getCurrentProgressStep() {
    return this.currentProgressStep;
  }

  resetLoadProgress() {
    this.loadingSteps.forEach((step) => {
      step.logs = '';
    step.hasError = false;
  });
  this.currentProgressStep = 0;

  this.loadFactoryInProgress = false;
  }

  isLoadFactoryInProgress() {
    return this.loadFactoryInProgress;
  }

  setLoadFactoryInProgress(value) {
    this.loadFactoryInProgress = value;
  }
}
