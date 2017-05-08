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

import org.springframework.security.oauth2.provider.authentication.BearerTokenExtractor;
import org.springframework.util.StringUtils;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

/**
 * Extracts the access token from a cookie.
 * Falls back to a BearerTokenExtractor extracting information from the Authorization header, if no cookie was found.
 */
public class CookieTokenExtractor extends BearerTokenExtractor {
    /**
     * Name of the access token cookie.
     */
    public static final String ACCESS_TOKEN_COOKIE = "accessToken";
    /**
     * Name of the refresh token cookie.
     */
    public static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    /**
     * Extract the JWT access token from the request, if present.
     * If not, then it falls back to the BearerTokenExtractor behaviour.
     *
     * @param request the request containing the cookies.
     * @return the extracted JWT token; or null.
     */
    @Override
    protected String extractToken(HttpServletRequest request) {
        String result;
        Cookie accessTokenCookie = getCookie(request, ACCESS_TOKEN_COOKIE);
        if (accessTokenCookie != null) {
            result = accessTokenCookie.getValue();
        } else {
            result = super.extractToken(request);
        }
        return result;
    }

    /**
     * Get a cookie by name from the given servlet request.
     *
     * @param request    the request containing the cookie.
     * @param cookieName the name of the cookie to get.
     * @return the resulting Cookie, or null.
     */
    public static Cookie getCookie(HttpServletRequest request, String cookieName) {
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

}
