<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.security.oauth2;

import org.springframework.security.oauth2.common.OAuth2AccessToken;

/**
 * Client talking to an OAuth2 Authorization server token endpoint.
 *
 * @see UaaTokenEndpointClient
 * @see OAuth2TokenEndpointClientAdapter
 */
public interface OAuth2TokenEndpointClient {
    /**
     * Send a password grant to the token endpoint.
     *
     * @param username the username to authenticate.
     * @param password his password.
     * @return the access token and enclosed refresh token received from the token endpoint.
     * @throws org.springframework.security.oauth2.common.exceptions.ClientAuthenticationException
     * if we cannot contact the token endpoint.
     */
    OAuth2AccessToken sendPasswordGrant(String username, String password);

    /**
     * Send a refresh_token grant to the token endpoint.
     *
     * @param refreshTokenValue the refresh token used to get new tokens.
     * @return the new access/refresh token pair.
     * @throws org.springframework.security.oauth2.common.exceptions.ClientAuthenticationException
     * if we cannot contact the token endpoint.
     */
    OAuth2AccessToken sendRefreshGrant(String refreshTokenValue);
}
