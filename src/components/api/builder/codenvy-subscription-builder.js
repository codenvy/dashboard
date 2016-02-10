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
 * This class is providing a builder for Subscription
 * @author Ann Shumilova
 */
export class CodenvySubscriptionBuilder {

  /**
   * Default constructor.
   */
  constructor() {
    this.subscription = {};
    this.subscription.properties = {};
  }

  /**
   * Sets the id of the account
   * @param accountId the account id
   * @returns {CodenvySubscriptionBuilder}
   */
  withAccountId(accountId) {
    this.subscription.accountId = accountId;
    return this;
  }

  /**
   * Sets the id of the subscription
   * @param id the id to use
   * @returns {CodenvySubscriptionBuilder}
   */
  withId(id) {
    this.subscription.id = id;
    return this;
  }

  /**
   * Sets the service id of the subscription
   * @param serviceId the service id to use
   * @returns {CodenvySubscriptionBuilder}
   */
    withServiceId(serviceId) {
    this.subscription.serviceId = serviceId;
    return this;
  }

  /**
   * Sets the plan id of the subscription
   * @param planId the plan id to use
   * @returns {CodenvySubscriptionBuilder}
   */
    withPlanId(planId) {
    this.subscription.planId = planId;
    return this;
  }



  /**
   * Sets an property of the subscription
   * @param name the property's name
   * @param value the property's value
   * @returns {CodenvySubscriptionBuilder}
   */
  withProperty(name, value) {
    this.subscription.properties[name] = value;
    return this;
  }


  /**
   * Build the subscription
   * @returns {CodenvySubscriptionBuilder.subscription|*}
   */
  build() {
    return this.subscription;
  }


}
