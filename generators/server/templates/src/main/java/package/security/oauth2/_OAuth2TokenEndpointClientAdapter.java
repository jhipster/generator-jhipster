<%#
 Copyright 2013-2017 the original author or authors.

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

import io.github.jhipster.config.JHipsterProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.exceptions.InvalidClientException;
import org.springframework.util.Base64Utils;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;

/**
 * @author markus.oellinger
 */
public abstract class OAuth2TokenEndpointClientAdapter implements OAuth2TokenEndpointClient {
    private final Logger log = LoggerFactory.getLogger(UaaTokenEndpointClient.class);
    protected final RestTemplate restTemplate;
    protected final JHipsterProperties jHipsterProperties;

    public OAuth2TokenEndpointClientAdapter(RestTemplate restTemplate, JHipsterProperties jHipsterProperties) {
        this.restTemplate = restTemplate;
        this.jHipsterProperties = jHipsterProperties;
    }

    /**
     * Sends a password grant to UAA.
     *
     * @param username the username to authenticate.
     * @param password his password.
     * @return the access token.
     */
    @Override
    public OAuth2AccessToken sendPasswordGrant(String username, String password) {
        HttpHeaders reqHeaders = new HttpHeaders();
        reqHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> formParams = new LinkedMultiValueMap<>();
        formParams.set("username", username);
        formParams.set("password", password);
        formParams.set("grant_type", "password");
        addAuthentication(reqHeaders, formParams);
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formParams, reqHeaders);
        ResponseEntity<OAuth2AccessToken>
            responseEntity = restTemplate.postForEntity(getTokenEndpoint(), entity, OAuth2AccessToken.class);
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            log.debug("failed to authenticate user with UAA: {}", responseEntity.getStatusCodeValue());
            throw new HttpClientErrorException(responseEntity.getStatusCode());
        }
        OAuth2AccessToken accessToken = responseEntity.getBody();
        return accessToken;
    }

    /**
     * Sends a refresh grant to UAA using the current refresh token to obtain new tokens.
     *
     * @param refreshTokenValue the refresh token to use to obtain new tokens.
     * @return the new, refreshed access token.
     */
    @Override
    public OAuth2AccessToken sendRefreshGrant(String refreshTokenValue) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "refresh_token");
        params.add("refresh_token", refreshTokenValue);
        HttpHeaders headers = new HttpHeaders();
        addAuthentication(headers, params);
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);
        log.debug("contacting UAA to refresh OAuth2 JWT tokens");
        ResponseEntity<OAuth2AccessToken> responseEntity = restTemplate.postForEntity(getTokenEndpoint(), entity,
                                                                                      OAuth2AccessToken.class);
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            log.debug("failed to refresh tokens with UAA: {}", responseEntity.getStatusCodeValue());
            throw new HttpClientErrorException(responseEntity.getStatusCode());
        }
        OAuth2AccessToken accessToken = responseEntity.getBody();
        log.info("refreshed OAuth2 JWT cookies using refresh_token grant");
        return accessToken;
    }

    protected abstract void addAuthentication(HttpHeaders reqHeaders, MultiValueMap<String, String> formParams);

    /**Returns a Basic authorization header to be used to talk to UAA.*/
    protected String getAuthorizationHeader() {
        String clientId = getClientId();
        String clientSecret = getClientSecret();
        String authorization = clientId + ":" + clientSecret;
        return "Basic " + Base64Utils.encodeToString(authorization.getBytes(StandardCharsets.UTF_8));
    }

    protected String getClientSecret() {
        String clientSecret = jHipsterProperties.getSecurity().getClientAuthorization().getClientSecret();
        if(clientSecret == null) {
            throw new InvalidClientException("no client-secret configured in application properties");
        }
        return clientSecret;
    }

    protected String getClientId() {
        String clientId = jHipsterProperties.getSecurity().getClientAuthorization().getClientId();
        if(clientId == null) {
            throw new InvalidClientException("no client-id configured in application properties");
        }
        return clientId;
    }

    /**Returns the configured UAA token endpoint URI.*/
    protected String getTokenEndpoint() {
        String tokenEndpointUrl = jHipsterProperties.getSecurity().getClientAuthorization().getAccessTokenUri();
        if(tokenEndpointUrl == null) {
            throw new InvalidClientException("no token endpoint configured in application properties");
        }
        return tokenEndpointUrl;
    }

}
