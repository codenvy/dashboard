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

export class OnPremisesAdminYourLicenseCtrl {

  /**
   * Default constructor.
   * @ngInject for Dependency injection
   */
  constructor(imsArtifactApi) {
    'ngInject';

    let artifactsList = imsArtifactApi.getInstalledArtifactsList();

    artifactsList.then((artifacts) => {
      if (artifacts) {
        for (let artifact of artifacts) {
          if (artifact.artifact === 'codenvy') {
            this.installedVersion = artifact.version;
            break;
          }
        }
      }
    });

    this.licenseState = 'NO_LICENSE';
  }

}
