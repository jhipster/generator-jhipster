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
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.jwt.crypto.sign.RsaVerifier;
import org.springframework.security.jwt.crypto.sign.SignatureVerifier;
import org.springframework.security.oauth2.common.exceptions.InvalidClientException;
import org.springframework.stereotype.Component;
import org.springframework.util.Base64Utils;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Client talking to UAA's token endpoint to do different OAuth2 grants.
 */
@Component
public class UaaTokenEndpointClient extends OAuth2TokenEndpointClientAdapter implements OAuth2TokenEndpointClient {
    private final Logger log = LoggerFactory.getLogger(UaaTokenEndpointClient.class);

    public UaaTokenEndpointClient(DiscoveryClient discoveryClient, @Qualifier("loadBalancedRestTemplate") RestTemplate restTemplate,
                                  JHipsterProperties jHipsterProperties) {
        super(restTemplate, jHipsterProperties);
        // Load available UAA servers
        discoveryClient.getServices();
    }

    /**
     * Fetches the public key from the UAA.
     *
     * @return the public key used to verify JWT tokens; or null.
     */
    @Override
    public SignatureVerifier getSignatureVerifier() throws Exception {
        try {
            HttpEntity<Void> request = new HttpEntity<Void>(new HttpHeaders());
            String key = (String) restTemplate
                .exchange(getPublicKeyEndpoint(), HttpMethod.GET, request, Map.class).getBody()
                .get("value");
            return new RsaVerifier(key);
        } catch (IllegalStateException ex) {
            log.warn("could not contact UAA to get public key");
            return null;
        }

    }

    @Override
    protected void addAuthentication(HttpHeaders reqHeaders, MultiValueMap<String, String> formParams) {
        reqHeaders.add("Authorization", getAuthorizationHeader());
    }

    /**
     * @return a Basic authorization header to be used to talk to UAA.
     */
    protected String getAuthorizationHeader() {
        String clientId = getClientId();
        String clientSecret = getClientSecret();
        String authorization = clientId + ":" + clientSecret;
        return "Basic " + Base64Utils.encodeToString(authorization.getBytes(StandardCharsets.UTF_8));
    }

    /** Returns the configured endpoint URI to retrieve the public key. */
    protected String getPublicKeyEndpoint() {
        //TODO move to JHipsterProperties as a separate property
        String tokenEndpointUrl = jHipsterProperties.getSecurity().getClientAuthorization().getAccessTokenUri();
        if (tokenEndpointUrl == null) {
            throw new InvalidClientException("no token endpoint configured in application properties");
        }
        return tokenEndpointUrl + "_key";
    }

}
