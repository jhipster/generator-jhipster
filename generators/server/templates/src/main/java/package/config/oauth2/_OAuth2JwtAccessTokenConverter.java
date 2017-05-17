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
package <%=packageName%>.config.oauth2;

import <%=packageName%>.security.oauth2.OAuth2SignatureVerifierClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.jwt.crypto.sign.SignatureVerifier;
import org.springframework.security.oauth2.common.exceptions.InvalidTokenException;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;

import java.util.Map;

/**
 * Improved JwtAccessTokenConverter that can handle lazy fetching of public verifier keys.
 */
public class OAuth2JwtAccessTokenConverter extends JwtAccessTokenConverter {
    /**
     * Maximum refresh rate for public keys in ms.
     * We won't fetch new public keys any faster than that to avoid spamming UAA in case
     * we receive a lot of "illegal" tokens.
     * TODO: may want to externalize to JHipsterProperties
     */
    private static final long MAX_PUBLIC_KEY_REFRESH_RATE = 10 * 1000L;
    /**
     * Maximum TTL for the public key in ms.
     * The public key will be fetched again from UAA if it gets older than that.
     * That way, we make sure that we get the newest keys always in case they are updated there.
     */
    private static final long PUBLIC_KEY_TTL = 24 * 60 * 60 * 1000L;
    private final Logger log = LoggerFactory.getLogger(OAuth2JwtAccessTokenConverter.class);

    private final OAuth2SignatureVerifierClient signatureVerifierClient;
    /**
     * When did we last fetch the public key?
     */
    private long lastKeyFetchTimestamp;

    public OAuth2JwtAccessTokenConverter(OAuth2SignatureVerifierClient signatureVerifierClient) {
        this.signatureVerifierClient = signatureVerifierClient;
        tryCreateSignatureVerifier();
    }

    /**
     * Try to decode the token with the current public key.
     * If it fails, contact the OAuth2 server to get a new public key, then try again.
     * We might not have fetched it in the first place or it might have changed.
     *
     * @param token the JWT token to decode.
     * @return the resulting claims.
     * @throws InvalidTokenException if we cannot decode the token.
     */
    @Override
    protected Map<String, Object> decode(String token) {
        try {
            //check if our public key and thus SignatureVerifier have expired
            if (System.currentTimeMillis() - lastKeyFetchTimestamp > PUBLIC_KEY_TTL) {
                throw new InvalidTokenException("public key expired");
            }
            return super.decode(token);
        } catch (InvalidTokenException ex) {
            if (tryCreateSignatureVerifier()) {
                return super.decode(token);
            }
            throw ex;
        }
    }

    /**
     * Fetch a new public key from the AuthorizationServer.
     *
     * @return true, if we could fetch it; false, if we could not.
     */
    private boolean tryCreateSignatureVerifier() {
        long t = System.currentTimeMillis();
        if (t - lastKeyFetchTimestamp < MAX_PUBLIC_KEY_REFRESH_RATE) {
            return false;
        }
        try {
            SignatureVerifier verifier = signatureVerifierClient.getSignatureVerifier();
            setVerifier(verifier);
            lastKeyFetchTimestamp = t;
            return true;
        } catch (Throwable ex) {
            log.error("could not get public key from OAuth2 server to create SignatureVerifier", ex);
            return false;
        }
    }
}
