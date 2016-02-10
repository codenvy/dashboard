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
 * This class is providing the entry point for accessing to Codenvy API
 * It handles workspaces, projects, etc.
 * @author Florent Benoit
 */
export class CodenvyAPI {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor(codenvyAccount, codenvyAnalytics, codenvyAnalyticsSession,
                codenvyFactory, codenvyFactoryTemplate, codenvyPayment, codenvySaas, codenvyUser) {
    this.codenvyAccount = codenvyAccount;
    this.codenvyAnalytics = codenvyAnalytics;
    this.codenvyAnalyticsSession = codenvyAnalyticsSession;
    this.codenvyFactory = codenvyFactory;
    this.codenvyFactoryTemplate = codenvyFactoryTemplate;
    this.codenvyPayment = codenvyPayment;
    this.codenvySaas = codenvySaas;
    this.codenvyUser = codenvyUser;

  }


  /**
   * The Codenvy Account API
   * @returns {CodenvyAPI.codenvyAccount|*}
   */
  getAccount() {
    return this.codenvyAccount;
  }

  getAnalytics() {
    return this.codenvyAnalytics;
  }

  getAnalyticsSession() {
    return this.codenvyAnalyticsSession;
  }

  /**
   * The Codenvy Factory API
   * @returns {codenvyFactory|*}
   */
  getFactory() {
    return this.codenvyFactory;
  }

  /**
   * The Codenvy Factory Template API
   * @returns {CodenvyFactoryTemplate|*}
   */
  getFactoryTemplate() {
    return this.codenvyFactoryTemplate;
  }

  /**
   * The Codenvy Payment API
   * @returns {CodenvyAPI.codenvyPayment|*}
   */
  getPayment() {
    return this.codenvyPayment;
  }

  /**
   * The Codenvy Saas API
   * @returns {CodenvyAPI.codenvySaas|*}
   */
  getSaas() {
    return this.codenvySaas;
  }

  /**
   * The Codenvy User API
   * @returns {CodenvyAPI.codenvyUser|*}
   */
  getUser() {
    return this.codenvyUser;
  }

}
