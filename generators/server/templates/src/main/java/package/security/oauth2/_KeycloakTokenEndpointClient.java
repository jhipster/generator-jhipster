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
import org.springframework.http.HttpMethod;
import org.springframework.security.jwt.crypto.sign.RsaVerifier;
import org.springframework.security.jwt.crypto.sign.SignatureVerifier;
import org.springframework.security.oauth2.common.util.JsonParser;
import org.springframework.security.oauth2.common.util.JsonParserFactory;
import org.springframework.util.Base64Utils;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import sun.security.rsa.RSAKeyFactory;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.interfaces.RSAKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Map;

/**
 * @author markus.oellinger
 */
public class KeycloakTokenEndpointClient extends OAuth2TokenEndpointClientAdapter implements OAuth2TokenEndpointClient {
    private final Logger log = LoggerFactory.getLogger(KeycloakTokenEndpointClient.class);
    private JsonParser jsonParser;

    public KeycloakTokenEndpointClient(RestTemplate restTemplate, JHipsterProperties jHipsterProperties) {
        super(restTemplate, jHipsterProperties);
        jsonParser = JsonParserFactory.create();
    }

    @Override
    public SignatureVerifier getSignatureVerifier() {
        String publicKeyEndpointUri = getTokenEndpoint().replace("/token", "/certs");
        HttpEntity<Void> request = new HttpEntity<Void>(new HttpHeaders());
        String json = (String) restTemplate
            .exchange(publicKeyEndpointUri, HttpMethod.GET, request, Map.class).getBody()
            .get("keys");
        Map<String, Object> map=jsonParser.parseMap(json);
        String e=(String)map.get("e");
        BigInteger modulus=new BigInteger(1, Base64Utils.decodeFromUrlSafeString((String)map.get("n")));
        BigInteger publicExponent = new BigInteger(1, Base64Utils.decodeFromString((String)map.get("e")));
        try {
            PublicKey publicKey=KeyFactory.getInstance("RSA").generatePublic(new RSAPublicKeySpec(modulus, publicExponent));
            RSAPublicKey rsaKey=(RSAPublicKey)RSAKeyFactory.toRSAKey(publicKey);
            return new RsaVerifier(rsaKey);
        }
        catch(Throwable ex) {
            log.warn("could not retrieve public key from keycloak", ex);
            return null;
        }
    }

    @Override
    protected void addAuthentication(HttpHeaders reqHeaders, MultiValueMap<String, String> formParams) {
        formParams.set("client_id", getClientId());
        formParams.set("client_secret", getClientSecret());
    }

}
