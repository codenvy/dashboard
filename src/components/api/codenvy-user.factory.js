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
 * This class is handling the user API retrieval
 * @author Oleksii Orel
 */
export class CodenvyUser {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor($resource, $q) {

    // keep resource
    this.$resource = $resource;
    this.$q = $q;

    // remote call
    this.remoteUserAPI = this.$resource('/api/user', {}, {
      findByID: {method: 'GET', url: '/api/user/:userId'},
      findByAlias: {method: 'GET', url: '/api/user/find?alias=:alias'},
      inRole: {method: 'GET', url: '/api/user/inrole?role=:role&scope=:scope&scopeId=:scopeId'},
      setPassword: {
        method: 'POST', url: '/api/user/password', isArray: false,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      },
      createUser: {method: 'POST', url: '/api/user/create'},
      getUsers: {method: 'GET', url: '/api/admin/user?maxItems=:maxItems&skipCount=:skipCount', isArray: true},
      removeUserById: {method: 'DELETE', url: '/api/user/:userId'}
    });

    // users by ID
    this.useridMap = new Map();

    // users by alias
    this.userAliasMap = new Map();

    // user roles
    this.isUserInRoleMap = new Map();

    // fetch the user when we're initialized
    this.fetchUser();

    this.isLogged = false;

    this.userPromise = null;

    // all users by ID
    this.adminUsersMap = new Map();
  }

  /**
   * Create new user
   * @param name - new user name
   * @param email - new user e-mail
   * @param password - new user password
   * @returns {*}
   */
  createUser(name, email, password) {
    let data = {
      password: password,
      name: name
    };

    if (email) {
      data.email = email;
    }

    let promise = this.remoteUserAPI.createUser(data).$promise;

    // check if was OK or not
    promise.then((user) => {
      //update users map
      this.adminUsersMap.set(user.id, user);//add user
    });

    return promise;
  }

  /**
   * Ask for loading the users in asynchronous way
   * If there are no changes, it's not updated
   * @param maxItems - the max number of items to return
   * @param skipCount - the number of items to skip
   * @returns {*} the promise
   */
  fetchUsers(maxItems, skipCount) {
    let promise = this.remoteUserAPI.getUsers({maxItems: maxItems, skipCount: skipCount}).$promise;

    promise.then((remoteUsers) => {
      //update users map
      remoteUsers.forEach((user) => {
        this.adminUsersMap.set(user.id, user);//add user
      });
    });

    return promise;
  }

  /**
   * Gets the users
   * @returns {Map}
   */
  getUsersMap() {
    return this.adminUsersMap;
  }

  /**
   * Performs user deleting by the given user ID.
   * @param userId the user id
   * @returns {*} the promise
   */
  deleteUserById(userId) {
    let promise = this.remoteUserAPI.removeUserById({userId: userId}).$promise;

    // check if was OK or not
    promise.then(() => {
      //update users map
      this.adminUsersMap.delete(userId);//remove user
    });

    return promise;
  }

  /**
   * Gets the user ID
   * @return user ID
   */
  getUser() {
    // try to refresh if user is not yet logged in
    if (!this.isLogged) {
      this.fetchUser();
    }
    return this.user;
  }

  /**
   * Gets the user data
   */
  refetchUser() {
    return this.fetchUser(true);
  }

  /**
   * Gets the user data
   */
  fetchUser(ignoreCache) {
    if (!ignoreCache && this.userPromise) {
      return this.userPromise;
    }
    let user = this.remoteUserAPI.get();

    // check admin or not
    let isAdminPromise = this.fetchIsUserInRole('admin', 'system', '');
    let isUserPromise = this.fetchIsUserInRole('user', 'system', '');

    let promise = user.$promise;
    // check if if was OK or not
    let updatePromise = promise.then(() => {
      this.isLogged = true;
    }, () => {
      this.isLogged = false;
    });
    let allPromise = this.$q.all([updatePromise, isUserPromise, isAdminPromise]);
    this.userPromise = allPromise.then(() => {
      this.user = user;
    });

    return this.userPromise;
  }


  fetchUserId(userId) {
    let promise = this.remoteUserAPI.findByID({userId: userId}).$promise;
    let parsedResultPromise = promise.then((user) => {
      this.useridMap.set(userId, user);
    });

    return parsedResultPromise;

  }

  getUserFromId(userId) {
    return this.useridMap.get(userId);
  }

  fetchUserByAlias(alias) {
    let promise = this.remoteUserAPI.findByAlias({alias: alias}).$promise;
    let parsedResultPromise = promise.then((user) => {
      this.useridMap.set(user.id, user);
      this.userAliasMap.set(alias, user);
    });

    return parsedResultPromise;

  }

  getUserByAlias(userAlias) {
    return this.userAliasMap.get(userAlias);
  }

  setPassword(password) {
    let promise = this.remoteUserAPI.setPassword('password=' + password).$promise;

    return promise;
  }

  fetchIsUserInRole(role, scope, scopeId) {
    let promise = this.remoteUserAPI.inRole({role: role, scope: scope, scopeId: scopeId}).$promise;
    let parsedResultPromise = promise.then((userInRole) => {
      this.isUserInRoleMap.set(scope + '/' + role + ':' + scopeId, userInRole);
    }, () => {

    });
    return parsedResultPromise;
  }

  /**
   * Check if useris admin or not by checking the system admin role
   * @returns {*}
   */
  isAdmin() {
    let userInRole = this.isUserInRoleMap.get('system/admin:');
    return userInRole && userInRole.isInRole;
  }

  /**
   * Check if user is user or not by checking the user role
   * @returns {*}
   */
  isUser() {
    let userInRole = this.isUserInRoleMap.get('system/user:');
    return userInRole && userInRole.isInRole;
  }


  /**
   * Forms the string to display from list of roles.
   * @returns {String}
   */
  getDisplayRole(roles) {
    let str = '';

    roles.forEach((role) => {
      let parts = role.split('/');
      str += parts && parts.length > 1 ? parts[1] : role;
      str += ' ';
    });

    return str;
  }

}
