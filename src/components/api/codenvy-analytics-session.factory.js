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
 * @ngdoc factory
 * @name api.analytics-session.factory:CodenvyAnalyticsSession
 *
 * @description Allow to report current session usage to analytics
 *
 * @author Florent Benoit
 */
export class CodenvyAnalyticsSession {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor ($interval, uuid4, codenvyAnalytics, $window) {
    this.$interval = $interval;
    this.uuid4 = uuid4;
    this.codenvyAnalytics = codenvyAnalytics;

    this.$window = $window;

    this.active = true;
    this.uuid = uuid4.generate();
    this.updateUsageTime();

    this.TTL = 60000; // 1mn
    this.RENEW_TTL = 600000; // 10mn

    // init the events
    this.initEvents();

    // log first event
    this.logSessionUsageEvent(true);

    // start interval
    this.$interval(() => {this.logSessionUsageEvent(false);}, 5000);
  }

  /**
   * Allow to be notified when browser is closing and when there is focus or idle on the current window.
   */
  initEvents() {
    let myEvent = this.$window.attachEvent || this.$window.addEventListener;
    var chkevent = this.$window.attachEvent ? 'onbeforeunload' : 'beforeunload';

    myEvent(chkevent, () =>  {
      // always log session when closing tab
      this.codenvyAnalytics.logSession(this.uuid);
      return;
    });

    this.$window.onfocus = () => {
      this.active = true;
      this.logSessionUsageEvent();
    };

    this.$window.onblur = () => {
      this.active = false;
      this.logSessionUsageEvent();
    };

  }

  /**
   * Update last usage time with current date
   */
  updateUsageTime() {
    this.lastUsageTime = new Date().getTime();
  }

  /**
   * Get delta about current time and last updated usage
   * @returns {number}
   */
  getIdleUsageTime() {
    return new Date().getTime()  - this.lastUsageTime;
  }


  /**
   * True if user is usage time idle is > TTL
   * @returns {boolean}
   */
  idleDelay() {
    return this.getIdleUsageTime() > this.TTL;
  }


  /**
   * Log the current session usage.
   * If force, always log. Else, log only if delta > TTL
   * @param force
   */
  logSessionUsageEvent(force) {
    // Change session ID if idle since a long time
    if (this.active && this.getIdleUsageTime() > this.RENEW_TTL) {
      // generate a new id and force to log a new event
      this.uuid = this.uuid4.generate();
      force = true;
    }

    if (force || (this.active && this.idleDelay())) {
      this.codenvyAnalytics.logSession(this.uuid);
      this.updateUsageTime();
    }
  }

}
