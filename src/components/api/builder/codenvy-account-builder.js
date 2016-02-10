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
 * This class is providing a builder for Account
 * @author Ann Shumilova
 */
export class CodenvyAccountBuilder {

  /**
   * Default constructor.
   */
  constructor() {
    this.account = {};
    this.account.attributes = {};
  }


  /**
   * Sets the name of the account
   * @param name the name to use
   * @returns {CodenvyAccountBuilder}
   */
  withName(name) {
    this.account.name = name;
    return this;
  }

  /**
   * Sets the id of the account
   * @param id the id to use
   * @returns {CodenvyAccountBuilder}
   */
  withId(id) {
    this.account.id = id;
    return this;
  }



  /**
   * Sets an attribute on the account
   * @param name the attribute's name
   * @param value the attribute's value
   * @returns {CodenvyAccountBuilder}
   */
  withAttribute(name, value) {
    this.account.attributes[name] = value;
    return this;
  }


  /**
   * Build the account
   * @returns {CodenvyAccountBuilder.account|*}
   */
  build() {
    return this.account;
  }


}
