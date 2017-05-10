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
package <%=packageName%>.security.uaa;

import com.google.common.net.InternetDomainName;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.security.jwt.Jwt;
import org.springframework.security.jwt.JwtHelper;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2RefreshToken;
import org.springframework.util.Base64Utils;
import org.springframework.util.StringUtils;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Helps with OAuth2 cookie handling.
 */
public class OAuth2CookieHelper {
    /**
     * Name of the access token cookie.
     */
    public static final String ACCESS_TOKEN_COOKIE = "uaa-accessToken";
    /**
     * Name of the refresh token cookie for sessions (no remember me).
     */
    public static final String SESSION_REFRESH_TOKEN_COOKIE = "uaa-sessionRefreshToken";
    /**
     * Name of the persistent refresh token cookie (with remember me).
     * The reason why we need two different cookie names is that it is impossible
     * for the server to find out when refreshing the tokens whether remember me
     * was originally chosen or not (i.e. whether the cookie must be persistent or session only).
     */
    public static final String PERSISTENT_REFRESH_TOKEN_COOKIE = "uaa-storedRefreshToken";
    /**
     * Name of the cookie holding the cllient authorization presented by the client during authentication.
     * This is stored since we need it again when we refresh the tokens.
     * The cookie holds the original base64 encoded Authorization header content,
     * e.g. <code>Basic d2ViX2FwcDo=</code>.
     */
    public static final String CLIENT_AUTHORIZATION_COOKIE = "uaa-clientAuthorization";
    private static final List<String> cookieNames = Arrays.asList(ACCESS_TOKEN_COOKIE, SESSION_REFRESH_TOKEN_COOKIE,
        PERSISTENT_REFRESH_TOKEN_COOKIE, CLIENT_AUTHORIZATION_COOKIE);
    /**
     * Number of seconds to expire refresh token cookies before the enclosed token expires.
     * This makes sure we don't run into race conditions where the cookie is still there but
     * expires while be process it.
     */
    private static final long REFRESH_TOKEN_EXPIRATION_WINDOW_SECS = 3L;

    private final Logger log = LoggerFactory.getLogger(OAuth2CookieHelper.class);
    /**
     * Used to parse JWT claims.
     */
    private JsonParser jsonParser = JsonParserFactory.getJsonParser();

    public static Cookie getAccessTokenCookie(HttpServletRequest request) {
        return getCookie(request, ACCESS_TOKEN_COOKIE);
    }

    public static Cookie getRefreshTokenCookie(HttpServletRequest request) {
        Cookie refreshTokenCookie = getCookie(request, SESSION_REFRESH_TOKEN_COOKIE);
        if (refreshTokenCookie == null) {
            refreshTokenCookie = getCookie(request, PERSISTENT_REFRESH_TOKEN_COOKIE);
        }
        return refreshTokenCookie;
    }

    public static String getClientAuthorizationCookieValue(HttpServletRequest request) {
        Cookie cookie = getCookie(request, CLIENT_AUTHORIZATION_COOKIE);
        return getClientAuthorizationCookieValue(cookie);
    }

    public static String getClientAuthorizationCookieValue(Cookie cookie) {
        if (cookie != null) {
            return new String(Base64Utils.decodeFromUrlSafeString(cookie.getValue()));
        }
        return null;
    }

    /**
     * Create a cookie to remember the Authorization header the client presented during authentication.
     * We will need it again when issuing the refresh_token grant on behalf of that client.
     *
     * @param authorization the Basic Authorization header we received during authentication.
     * @return the cookie containing this in a browser-friendly encoded way.
     */
    public static Cookie createClientAuthorizationCookie(String authorization) {
        String value = Base64Utils.encodeToUrlSafeString(authorization.getBytes());
        return new Cookie(CLIENT_AUTHORIZATION_COOKIE, value);
    }

    /**
     * Get a cookie by name from the given servlet request.
     *
     * @param request    the request containing the cookie.
     * @param cookieName the case-sensitive name of the cookie to get.
     * @return the resulting Cookie; or null, if not found.
     */
    private static Cookie getCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals(cookieName)) {
                    String value = cookie.getValue();
                    if (StringUtils.hasText(value)) {
                        return cookie;
                    }
                }
            }
        }
        return null;
    }

    /**
     * Returns true if the refresh token cookie was set with remember me checked.
     *
     * @param refreshTokenCookie the cookie we investigate.
     * @return true, if it was set persistently (i.e. for "remember me").
     */
    public static boolean isRememberMe(Cookie refreshTokenCookie) {
        return PERSISTENT_REFRESH_TOKEN_COOKIE.equals(refreshTokenCookie.getName());
    }

    /**
     * Create cookies using the provided values.
     *
     * @param request             the request we are handling.
     * @param accessToken         the access token and enclosed refresh token for our cookies.
     * @param rememberMe          whether the user had originally checked "remember me".
     * @param authorizationHeader the "Authorization" header the client had presented during authentication.
     * @param result              will get the resulting cookies set.
     */
    public void createCookies(HttpServletRequest request, OAuth2AccessToken accessToken, boolean rememberMe,
                              String authorizationHeader, OAuth2Cookies result) {
        String domain = getCookieDomain(request);
        log.debug("creating cookies for domain {}", domain);
        Cookie accessTokenCookie = new Cookie(ACCESS_TOKEN_COOKIE, accessToken.getValue());
        setCookieProperties(accessTokenCookie, request.isSecure(), domain);
        log.debug("created access token cookie '{}'", accessTokenCookie.getName());

        OAuth2RefreshToken refreshToken = accessToken.getRefreshToken();
        Cookie refreshTokenCookie;
        if (rememberMe) {           //keep token around if rememberMe is true
            refreshTokenCookie = new Cookie(PERSISTENT_REFRESH_TOKEN_COOKIE, refreshToken.getValue());
            refreshTokenCookie.setMaxAge((int) getMaxAge(refreshToken));
        } else {
            refreshTokenCookie = new Cookie(SESSION_REFRESH_TOKEN_COOKIE, refreshToken.getValue());
        }
        setCookieProperties(refreshTokenCookie, request.isSecure(), domain);
        log.debug("created refresh token cookie '{}', age: {}", refreshTokenCookie.getName(), refreshTokenCookie.getMaxAge());
        Cookie clientAuthorizationCookie = createClientAuthorizationCookie(authorizationHeader);
        setCookieProperties(clientAuthorizationCookie, request.isSecure(), domain);
        clientAuthorizationCookie.setMaxAge(refreshTokenCookie.getMaxAge());        //same age as refresh token cookie
        log.debug("created client authorization cookie '{}', age: {}", clientAuthorizationCookie.getName(), clientAuthorizationCookie.getMaxAge());
        result.setCookies(accessTokenCookie, refreshTokenCookie, clientAuthorizationCookie);
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
                long expiresIn = Long.parseLong(exp.toString()) - System.currentTimeMillis() / 1000L;
                log.debug("refresh token valid for another {} secs", expiresIn);
                //expire a bit earlier than the token to avoid race conditions
                expiresIn -= REFRESH_TOKEN_EXPIRATION_WINDOW_SECS;
                return expiresIn;
            }
        } catch (RuntimeException ex) {
            log.error("could not parse refresh token claims", ex);
        }
        //cannot determine refresh token expiry date, fall back to session cookie
        return -1L;
    }

    /**
     * Set cookie properties of access and refresh tokens.
     *
     * @param cookie   the cookie to modify.
     * @param isSecure whether it is coming from a secure request.
     * @param domain   the domain for which the cookie is valid. If null, then will fall back to default.
     */
    private void setCookieProperties(Cookie cookie, boolean isSecure, String domain) {
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setSecure(isSecure);       //if the request comes per HTTPS set the secure option on the cookie
        if (domain != null) {
            cookie.setDomain(domain);
        }
    }

    /**
     * Logs the user out by clearing all cookies.
     *
     * @param httpServletRequest  the request containing the Cookies.
     * @param httpServletResponse the response used to clear them.
     */
    public void clearCookies(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) {
        String domain = getCookieDomain(httpServletRequest);
        clearCookie(httpServletRequest, httpServletResponse, domain, ACCESS_TOKEN_COOKIE);
        clearCookie(httpServletRequest, httpServletResponse, domain, SESSION_REFRESH_TOKEN_COOKIE);
        clearCookie(httpServletRequest, httpServletResponse, domain, PERSISTENT_REFRESH_TOKEN_COOKIE);
        clearCookie(httpServletRequest, httpServletResponse, domain, CLIENT_AUTHORIZATION_COOKIE);
    }

    private void clearCookie(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse,
                             String domain, String cookieName) {
        Cookie cookie = new Cookie(cookieName, "");
        setCookieProperties(cookie, httpServletRequest.isSecure(), domain);
        cookie.setMaxAge(0);
        httpServletResponse.addCookie(cookie);
        log.debug("clearing cookie {}", cookie.getName());
    }

    /**
     * Returns the top level domain of the server from the request. This is used to limit the Cookie
     * to the top domain instead of the full domain name.
     * <p>
     * A lot of times, individual gateways of the same domain get their own subdomain but authentication
     * shall work across all subdomains of the top level domain.
     * <p>
     * For example, when sending a request to <code>app1.domain.com</code>,
     * this returns <code>.domain.com</code>.
     *
     * @param request the HTTP request we received from the client.
     * @return the top level domain to set the cookies for.
     */
    private String getCookieDomain(HttpServletRequest request) {
        String domain = request.getServerName().toLowerCase();
        //strip off leading www.
        if (domain.startsWith("www.")) {
            domain = domain.substring(4);
        }
        //strip off subdomains, leaving the top level domain only
        InternetDomainName domainName = InternetDomainName.from(domain);
        if (domainName.isUnderPublicSuffix() && !domainName.isTopPrivateDomain()) {
            //preserve leading dot
            return "." + domainName.topPrivateDomain().toString();
        }
        return domain;
    }

    /**
     * Replace or add a Cookie in an array of Cookies.
     * Does its best to replace inline.
     *
     * @param cookies   our current array of Cookies.
     * @param newCookie the new cookie to add to the above array. Will replace a cookie of similar name.
     * @return the modified cookies. This may be a new array if the new cookie did not fit.
     */
    public Cookie[] addCookie(Cookie[] cookies, Cookie newCookie) {
        if (cookies != null && cookies.length > 0) {
            for (int i = 0; i < cookies.length; i++) {
                if (cookies[i].getName().equals(newCookie.getName())) {
                    cookies[i] = newCookie;
                    return cookies;
                }
            }
            //original cookies array has not enough space, we must allocate a new cookie array
            int n = cookies.length;
            cookies = Arrays.copyOf(cookies, n + 1);
            cookies[n] = newCookie;
        } else {      //no cookies set currently, should not be happening, but set them anyway
            cookies = new Cookie[1];
            cookies[0] = newCookie;
        }
        return cookies;
    }

    public Cookie[] removeCookies(Cookie[] cookies, List<String> cookieNames) {
        List<Cookie> cookieList = null;
        if (cookies != null && cookies.length > 0) {
            for (int i = 0; i < cookies.length; i++) {
                if (cookieNames.contains(cookies[i].getName())) {
                    if (cookieList == null) {
                        cookieList = new ArrayList<>(cookies.length - 1);
                        for (int j = 0; j < i; j++) {
                            cookieList.add(cookies[j]);
                        }
                    }
                } else if (cookieList != null) {
                    cookieList.add(cookies[i]);
                }
            }
        }
        if (cookieList != null) {
            Cookie[] newCookies = new Cookie[cookieList.size()];
            return cookieList.toArray(newCookies);
        }
        return cookies;
    }

    public Cookie[] stripTokens(Cookie[] cookies) {
        return removeCookies(cookies, cookieNames);
    }
}
