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
package <%=packageName%>.security;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.net.InternetDomainName;
import io.github.jhipster.config.JHipsterProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.http.*;
import org.springframework.security.jwt.Jwt;
import org.springframework.security.jwt.JwtHelper;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2RefreshToken;
import org.springframework.util.Base64Utils;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * This service is used to create cookies for OAuth2 access and refresh tokens.
 * It also automatically uses the refresh tokens to obtain a new pair of tokens if the access token is invalid.
 */
public class UaaAuthenticationService {
    private final Logger log = LoggerFactory.getLogger(UaaAuthenticationService.class);
    /**
     * Number of seconds to cache refresh token grants so we don't have to repeat them in case of parallel requests.
     */
    private static final long REFRESH_TOKEN_CACHE_SECS = 10l;

    private final JHipsterProperties jHipsterProperties;
    /**
     * Used to contact the UAA server.
     */
    private final RestTemplate restTemplate;

    /**
     * Caches Refresh grant results for a refresh token value so we can reuse them.
     * This avoids hammering UAA in case of several multi-threaded requests arriving in parallel.
     */
    private final Cache<String, RefreshGrantResult> recentlyRefreshed;

    private JsonParser jsonParser = JsonParserFactory.getJsonParser();

    public UaaAuthenticationService(JHipsterProperties jHipsterProperties, RestTemplate restTemplate) {
        this.jHipsterProperties = jHipsterProperties;
        this.restTemplate = restTemplate;
        recentlyRefreshed = CacheBuilder.newBuilder()
            .expireAfterWrite(REFRESH_TOKEN_CACHE_SECS, TimeUnit.SECONDS)
            .build();
    }

    /**
     * Authenticate the user by username and password.
     *
     * @param request  the request coming from the client.
     * @param response the response going back to the server.
     * @param params   the params holding the username, password and rememberMe.
     * @return the OAuth2AccessToken as a ResponseEntity. Will return OK (200), if successful.
     * If the UAA cannot authenticate the user, the status code returned by UAA will be returned.
     */
    public ResponseEntity<OAuth2AccessToken> authenticate(HttpServletRequest request, HttpServletResponse response, Map<String, String> params) {
        try {
            HttpHeaders reqHeaders = new HttpHeaders();
            reqHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            reqHeaders.add("Authorization", request.getHeader("Authorization"));                //take over Authorization header from client request to UAA request
            boolean rememberMe = Boolean.valueOf(params.remove("rememberMe"));
            MultiValueMap<String, String> formParams = new LinkedMultiValueMap<>();
            formParams.setAll(params);
            formParams.add("grant_type", "password");
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formParams, reqHeaders);
            ResponseEntity<OAuth2AccessToken> responseEntity = restTemplate.postForEntity("http://uaa/oauth/token",
                entity, OAuth2AccessToken.class);
            if (responseEntity.getStatusCode() != HttpStatus.OK) {
                log.debug("failed to authenticate user with UAA: {}", responseEntity.getStatusCodeValue());
                return responseEntity;
            }
            OAuth2AccessToken accessToken = responseEntity.getBody();
            addCookies(request, response, accessToken, rememberMe);
            return responseEntity;
        } catch (Exception ex) {
            log.error("failed to get OAuth2 tokens from UAA", ex);
            throw ex;
        }
    }

    /**
     * Returns the top level domain of the server from the request. This is used to limit the Cookie
     * to the top domain instead of the full domain name.
     * <p>
     * A lot of times, individual gateways of the same domain get their own subdomain but authentication
     * shall work across all subdomains of the top level domain.
     *
     * @param request the HTTP request we received from the client.
     */
    private String getCookieDomain(HttpServletRequest request) {
        String domain = request.getServerName().toLowerCase();
        //strip off leading www.
        if (domain.startsWith("www.")) {
            domain = domain.substring(4);
        }
        InternetDomainName domainName = InternetDomainName.from(domain);
        if (domainName.isUnderPublicSuffix() && !domainName.isTopPrivateDomain()) {
            return "." + domainName.topPrivateDomain().toString();
        }
        return domain;
    }

    /**
     * Add the access token and refresh token as cookies to the response.
     *
     * @param request     the request that came in (to determine whether it's a secure channel).
     * @param response    the response to add them to.
     * @param accessToken the access token and enclosed refresh token to add.
     * @param rememberMe  if true, then the cookies will be persistent.
     *                    If false, then they will be limited to the duration of the session.
     */
    private void addCookies(HttpServletRequest request, HttpServletResponse response, OAuth2AccessToken accessToken, boolean rememberMe) {
        String domain = getCookieDomain(request);
        Cookie accessTokenCookie = createAccessTokenCookie(request, accessToken, domain);
        response.addCookie(accessTokenCookie);
        OAuth2RefreshToken refreshToken = accessToken.getRefreshToken();
        if (refreshToken != null) {
            Cookie refreshTokenCookie = createRefreshTokenCookie(request, refreshToken, rememberMe, domain);
            response.addCookie(refreshTokenCookie);
        }
    }

    /**
     * Try to refresh the access token using the refresh token provided as cookie.
     * Note that browsers typically send multiple requests in parallel which means the access token
     * will be expired on multiple threads. We don't want to send multiple requests to UAA though,
     * so we need to cache results for a certain duration and synchronize threads to avoid sending
     * multiple requests in parallel.
     *
     * @param request       the request potentially holding the refresh token.
     * @param response      the response setting the new cookies (if refresh was successful).
     * @param refreshCookie the refresh token cookie. Must not be null.
     * @return the new servlet request containing the updated cookies for relaying downstream.
     */
    public HttpServletRequest refreshToken(HttpServletRequest request, HttpServletResponse response, Cookie
        refreshCookie) {
        String refreshTokenValue = refreshCookie.getValue();
        RefreshGrantResult result = getRefreshGrantResult(refreshTokenValue);
        synchronized (result) {
            //check if we have a result from another thread already
            if (result.getAccessTokenCookie() == null) {            //no, we are first!
                //send a refresh_token grant to UAA, getting new tokens
                sendRefreshGrant(request, refreshCookie, result);
                //add cookies to response to update browser
                response.addCookie(result.getAccessTokenCookie());
                response.addCookie(result.getRefreshTokenCookie());
            } else {
                log.debug("reusing cached refresh grant");
            }
            return new AuthorizedRequest(request, result.getAccessTokenCookie(),
                result.getRefreshTokenCookie());
        }
    }

    /**
     * Get the result from the cache in a thread-safe manner.
     *
     * @param refreshTokenValue the refresh token for which we want the results.
     * @return a RefreshGrantResult for that token. This will either be empty, if we are the first one to do the
     * request,
     * or contain some results already, if another thread already handled the grant for us.
     */
    private RefreshGrantResult getRefreshGrantResult(String refreshTokenValue) {
        synchronized (recentlyRefreshed) {
            RefreshGrantResult ctx = recentlyRefreshed.getIfPresent(refreshTokenValue);
            if (ctx == null) {
                ctx = new RefreshGrantResult();
                recentlyRefreshed.put(refreshTokenValue, ctx);
            }
            return ctx;
        }
    }

    /**
     * Sends a refresh grant to UAA using the current refresh token to obtain new tokens.
     *
     * @param request       the servlet request we received.
     * @param refreshCookie the refresh cookie to use to obtain new tokens.
     * @param result        will contain the new cookies after the call.
     */
    private void sendRefreshGrant(HttpServletRequest request, Cookie refreshCookie, RefreshGrantResult result) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "refresh_token");
        params.add("refresh_token", refreshCookie.getValue());
        //we must authenticate with the UAA server via HTTP basic authentication using the browser's client_id with no client secret
        HttpHeaders headers = new HttpHeaders();
        String authorization = "Basic d2ViX2FwcDo=";          //default authorization
        //read client ID from JWT token's client_id claim
        Jwt jwt = JwtHelper.decode(refreshCookie.getValue());
        String claims = jwt.getClaims();
        Map<String, Object> claimMap = jsonParser.parseMap(claims);
        String clientId = (String) claimMap.get("client_id");
        if (clientId != null) {
            params.add("client_id", clientId);
            authorization = clientId + ":";            //client ID with no password
            authorization = "Basic " + Base64Utils.encodeToString(authorization.getBytes());            //encode authorization header
        }
        headers.add("Authorization", authorization);
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);
        log.debug("contacting UAA to refresh OAuth2 JWT tokens on behalf of client_id {} with no secret", clientId);
        ResponseEntity<OAuth2AccessToken> responseEntity = restTemplate.postForEntity("http://uaa/oauth/token", entity,
            OAuth2AccessToken.class);
        OAuth2AccessToken accessToken = responseEntity.getBody();
        Cookie accessTokenCookie = createAccessTokenCookie(request, accessToken, refreshCookie.getDomain());
        boolean rememberMe = refreshCookie.getMaxAge() > 0;
        Cookie refreshTokenCookie = createRefreshTokenCookie(request, accessToken.getRefreshToken(), rememberMe,
            refreshCookie.getDomain());
        log.info("refreshed OAuth2 JWT cookies");
        result.setCookies(accessTokenCookie, refreshTokenCookie);
    }

    /**
     * Holds the results of a Refresh Grant which are the two new cookies, one for the new access token and one for the
     * new refresh token.
     */
    static private class RefreshGrantResult {
        private Cookie accessTokenCookie;
        private Cookie refreshTokenCookie;

        public Cookie getAccessTokenCookie() {
            return accessTokenCookie;
        }

        public Cookie getRefreshTokenCookie() {
            return refreshTokenCookie;
        }

        public void setCookies(Cookie accessTokenCookie, Cookie refreshTokenCookie) {
            this.accessTokenCookie = accessTokenCookie;
            this.refreshTokenCookie = refreshTokenCookie;
        }
    }

    /**
     * A request mapper used to modify the cookies in the original request.
     * This is needed such that we can modify the cookies of the request during a token refresh.
     * The token refresh happens before authentication by the <code>OAuth2AuthenticationProcessingFilter</code>
     * so we must make sure that further in the filter chain, we have the new cookies and not the expired/missing ones.
     */
    public static class AuthorizedRequest extends HttpServletRequestWrapper {
        /**
         * The new cookies of the request.
         */
        private Cookie[] cookies;

        public AuthorizedRequest(HttpServletRequest request, Cookie accessTokenCookie, Cookie refreshTokenCookie) {
            super(request);
            cookies = replaceCookies(request.getCookies(), accessTokenCookie, refreshTokenCookie);
        }

        /**
         * Replace cookies in request so the
         * {@link CookieTokenExtractor}
         * can pick them up later when it's  the  <code>OAuth2AuthenticationProcessingFilter</code>'s turn.
         *
         * @param cookies            the Cookies we are modifying.
         * @param accessTokenCookie  the new access token cookie.
         * @param refreshTokenCookie the new refresh token cookie.
         * @return the modified cookies.
         */
        private Cookie[] replaceCookies(Cookie[] cookies, Cookie accessTokenCookie, Cookie refreshTokenCookie) {
            if (cookies != null) {
                int n = 0;                //number of cookies that must be added
                if (accessTokenCookie != null) {
                    n++;
                }
                if (refreshTokenCookie != null) {
                    n++;
                }
                for (int i = 0; i < cookies.length; i++) {
                    Cookie cookie = cookies[i];
                    if (cookie.getName().equals(CookieTokenExtractor.ACCESS_TOKEN_COOKIE)) {
                        cookies[i] = accessTokenCookie;             //replace cookie
                        accessTokenCookie = null;     //mark as being replaced
                        n--;                //replaced, no new array slot needed
                    }
                    if (cookie.getName().equals(CookieTokenExtractor.REFRESH_TOKEN_COOKIE)) {
                        cookies[i] = refreshTokenCookie;
                        refreshTokenCookie = null;
                        n--;
                    }
                }
                if (n > 0) { //original cookies array has not enough space, we must allocate a new cookie array
                    n += cookies.length;
                    cookies = Arrays.copyOf(cookies, n);
                    if (refreshTokenCookie != null) {
                        cookies[--n] = refreshTokenCookie;
                    }
                    if (accessTokenCookie != null) {
                        cookies[--n] = accessTokenCookie;
                    }
                }
            } else {      //no cookies set currently, should not be happening, but set them anyway
                cookies = new Cookie[2];
                cookies[0] = accessTokenCookie;
                cookies[1] = refreshTokenCookie;
            }
            return cookies;
        }

        /**
         * Return the modified cookies instead of the original ones.
         */
        @Override
        public Cookie[] getCookies() {
            return cookies;
        }
    }

    /**
     * Convert the access token into a cookie.
     *
     * @param request     the request we are handling.
     * @param accessToken the access token to put into a cookie.
     * @param domain      the domain the cookie shall be valid for.
     * @return the resulting Cookie holding the access token.
     */
    public Cookie createAccessTokenCookie(HttpServletRequest request, OAuth2AccessToken accessToken, String domain) {
        Cookie cookie = new Cookie(CookieTokenExtractor.ACCESS_TOKEN_COOKIE, accessToken.getValue());
        setCookieProperties(cookie, request, domain);
        cookie.setMaxAge(-1);               //never keep token if browser is closed
        return cookie;
    }

    /**
     * Convert the refresh token into a cookie.
     *
     * @param request      the request we are handling.
     * @param refreshToken the refresh token to put into a cookie.
     * @param rememberMe   whether remember me was checked and the cookie thus
     *                     shall survive the browser lifecycle.
     * @param domain       the domain the cookie shall be valid for.
     * @return the resulting Cookie holding the refresh token.
     */
    public Cookie createRefreshTokenCookie(HttpServletRequest request, OAuth2RefreshToken refreshToken,
                                           boolean rememberMe, String domain) {
        Cookie cookie = new Cookie(CookieTokenExtractor.REFRESH_TOKEN_COOKIE,
            refreshToken.getValue());
        setCookieProperties(cookie, request, domain);
        int maxAge = -1;
        if (rememberMe) {           //keep token around if rememberMe is true
            maxAge = (int) getMaxAge(refreshToken);
        }
        cookie.setMaxAge(maxAge);
        return cookie;
    }

    /**
     * Retrieve the remaining duration of the refresh token.
     * If the refresh token does not contain an "exp" claim, then we revert back to a default duration.
     *
     * @param refreshToken the refresh token to examine.
     * @return the remaining duration in seconds.
     */
    private long getMaxAge(OAuth2RefreshToken refreshToken) {
        try {
            Jwt jwt = JwtHelper.decode(refreshToken.getValue());
            String claims = jwt.getClaims();
            Map<String, Object> claimsMap = jsonParser.parseMap(claims);
            Object exp = claimsMap.get("exp");
            if (exp != null) {
                long expiresIn = Long.parseLong(exp.toString()) - System.currentTimeMillis() / 1000l;
                log.debug("refresh token valid for another {} secs", expiresIn);
                return expiresIn;
            }
        } catch (RuntimeException ex) {
            log.error("could not parse refresh token claims", ex);
        }
        //fall back to defaults configured in properties
        return jHipsterProperties.getSecurity().getAuthentication().getJwt().getTokenValidityInSecondsForRememberMe();
    }

    /**
     * Set cookie properties of access and refresh tokens.
     *
     * @param cookie  the cookie to modify.
     * @param request the servlet request that came in.
     * @param domain  the domain for which the cookie is valid. If null, then will fall back to default.
     */
    private void setCookieProperties(Cookie cookie, HttpServletRequest request, String domain) {
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setSecure(request.isSecure());       //if the request comes per HTTPS set the secure option on the cookie
        if (domain != null) {
            cookie.setDomain(domain);
        }
    }

    /**
     * Clear the access token and refresh token cookies.
     *
     * @param httpServletRequest  the request containing the Cookies.
     * @param httpServletResponse the response used to clear them.
     */
    public void clearCookies(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) {
        Cookie accessTokenCookie = CookieTokenExtractor.getCookie(httpServletRequest, CookieTokenExtractor.ACCESS_TOKEN_COOKIE);
        if (accessTokenCookie != null) {
            accessTokenCookie.setValue("");
            accessTokenCookie.setMaxAge(0);
            accessTokenCookie.setPath("/");
            httpServletResponse.addCookie(accessTokenCookie);
            log.debug("clearing access token cookie");
        }
        Cookie refreshTokenCookie = CookieTokenExtractor.getCookie(httpServletRequest, CookieTokenExtractor.REFRESH_TOKEN_COOKIE);
        if (refreshTokenCookie != null) {
            refreshTokenCookie.setValue("");
            refreshTokenCookie.setMaxAge(0);
            refreshTokenCookie.setPath("/");
            httpServletResponse.addCookie(refreshTokenCookie);
            log.debug("clearing refresh token cookie");
        }
    }
}
