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
 * This class is providing a builder for membership
 * @author Ann Shumilova
 */
export class CodenvyMembershipBuilder {

  /**
   * Default constructor.
   */
  constructor() {
    this.membership = {};
    this.membership.roles = [];
  }


  /**
   * Sets the user's id
   * @param id the id of the user
   * @returns {CodenvyMembershipBuilder}
   */
  withUserId(id) {
    this.membership.userId = id;
    return this;
  }

  /**
   * Sets the role of membership
   * @param role the role to use
   * @returns {CodenvyMembershipBuilder}
   */
  withRole(role) {
    this.membership.roles.push(role);
    return this;
  }

  /**
   * Sets the account reference of membership
   * @param account the account refrence
   * @returns {CodenvyMembershipBuilder}
   */
  withAccountReference(account) {
    this.membership.accountReference = account;
    return this;
  }


  /**
   * Build the membership
   * @returns {CodenvyMembershipBuilder.membership|*}
   */
  build() {
    return this.membership;
  }

}
