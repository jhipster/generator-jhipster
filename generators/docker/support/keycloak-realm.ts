/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** The values of the Keycloak realm template (`realm-config/jhipster-realm.json` of the docker templates). */
export type KeycloakRealm = {
  /** Whether the realm has the internal client of the gateway and its service account user. */
  keycloakRealmGateway: boolean;
  /** The port of the root and admin urls of the web_app client. */
  keycloakRealmRootPort: number;
  /** The redirect uris of the web_app client. */
  keycloakRealmRedirectUris: string[];
  /** The web origins of the web_app client. */
  keycloakRealmWebOrigins: string[];
};

/**
 * The realm of a deployment: its web_app client redirects to the applications, to the ionic dev server, to the registry
 * and to the apps of the applications.
 */
export const getDeploymentKeycloakRealm = ({
  includesApplicationTypeGateway,
  entryPort,
  keycloakWebAppRedirectUris,
  keycloakAppSchemes,
}: {
  includesApplicationTypeGateway: boolean;
  entryPort: number;
  keycloakWebAppRedirectUris: string[];
  keycloakAppSchemes: string[];
}): KeycloakRealm => ({
  keycloakRealmGateway: includesApplicationTypeGateway,
  keycloakRealmRootPort: entryPort,
  keycloakRealmRedirectUris: [
    ...keycloakWebAppRedirectUris,
    'http://localhost:8100/*',
    'http://127.0.0.1:8761/*',
    ...keycloakAppSchemes.map(appScheme => `${appScheme}:*`),
    'dev.localhost.ionic:*',
  ],
  keycloakRealmWebOrigins: [
    ...keycloakWebAppRedirectUris.map(redirectUri => redirectUri.replace(/\/\*/g, '')),
    'http://localhost:8100',
    'http://127.0.0.1:8761',
  ],
});

/** The realm of the docker files of an application: its web_app client redirects to any local port and to its apps. */
export const getApplicationKeycloakRealm = ({
  applicationTypeGateway,
  serverPort,
  oauth2AppSchemes = [],
}: {
  applicationTypeGateway?: boolean;
  serverPort: number;
  oauth2AppSchemes?: string[];
}): KeycloakRealm => ({
  keycloakRealmGateway: Boolean(applicationTypeGateway),
  keycloakRealmRootPort: serverPort,
  keycloakRealmRedirectUris: [
    'dev.localhost.ionic:*',
    ...oauth2AppSchemes.map(appScheme => `${appScheme}:*`),
    'http://127.0.0.1:*',
    'http://localhost:*',
    'https://127.0.0.1:*',
    'https://localhost:*',
    'https://oauth.pstmn.io/v1/callback',
  ],
  keycloakRealmWebOrigins: ['*'],
});
