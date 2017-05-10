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

import <%=packageName%>.security.uaa.OAuth2CookieHelper;
import <%=packageName%>.security.uaa.UaaAuthenticationService;
import <%=packageName%>.web.filter.RefreshTokenFilter;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
import org.springframework.security.oauth2.common.DefaultOAuth2RefreshToken;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.when;

/**
 * Test password and refresh token grants.
 *
 * @see UaaAuthenticationService
 */
@RunWith(MockitoJUnitRunner.class)
public class UaaAuthenticationServiceTest {
    private static final String CLIENT_AUTHORIZATION = "Basic d2ViX2FwcDo=";
    private final String accessTokenValue = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0OTQyNzI4NDQsInVzZXJfbmFtZSI6InVzZXIiLCJhdXRob3JpdGllcyI6WyJST0xFX1VTRVIiXSwianRpIjoiNzc1ZTJkYWUtYWYzZi00YTdhLWExOTktNzNiZTU1MmIxZDVkIiwiY2xpZW50X2lkIjoid2ViX2FwcCIsInNjb3BlIjpbIm9wZW5pZCJdfQ.gEK0YcX2IpkpxnkxXXHQ4I0xzTjcy7edqb89ukYE0LPe7xUcZVwkkCJF_nBxsGJh2jtA6NzNLfY5zuL6nP7uoAq3fmvsyrcyR2qPk8JuuNzGtSkICx3kPDRjAT4ST8SZdeh7XCbPVbySJ7ZmPlRWHyedzLA1wXN0NUf8yZYS4ELdUwVBYIXSjkNoKqfWm88cwuNr0g0teypjPtjDqCnXFt1pibwdfIXn479Y1neNAdvSpHcI4Ost-c7APCNxW2gqX-0BItZQearxRgKDdBQ7CGPAIky7dA0gPuKUpp_VCoqowKCXqkE9yKtRQGIISewtj2UkDRZePmzmYrUBXRzfYw";
    private final String refreshTokenValue = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJ1c2VyIiwic2NvcGUiOlsib3BlbmlkIl0sImF0aSI6Ijc3NWUyZGFlLWFmM2YtNGE3YS1hMTk5LTczYmU1NTJiMWQ1ZCIsImV4cCI6MTQ5Njg2NDc0MywiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIl0sImp0aSI6IjhmYjI2YTllLTdjYzQtNDFlMi1hNzBjLTk4MDc0N2U2YWFiOSIsImNsaWVudF9pZCI6IndlYl9hcHAifQ.q1-Df9_AFO6TJNiLKV2YwTjRbnd7qcXv52skXYnog5siHYRoR6cPtm6TNQ04iDAoIHljTSTNnD6DS3bHk41mV55gsSVxGReL8VCb_R8ZmhVL4-5yr90sfms0wFp6lgD2bPmZ-TXiS2Oe9wcbNWagy5RsEplZ-sbXu3tjmDao4FN35ojPsXmUs84XnNQH3Y_-PY9GjZG0JEfLQIvE0J5BkXS18Z015GKyA6GBIoLhAGBQQYyG9m10ld_a9fD5SmCyCF72Jad_pfP1u8Z_WyvO-wrlBvm2x-zBthreVrXU5mOb9795wJEP-xaw3dXYGjht_grcW4vKUFtj61JgZk98CQ";
    private final String newAccessTokenValue = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0OTQyNzY2NDEsInVzZXJfbmFtZSI6InVzZXIiLCJhdXRob3JpdGllcyI6WyJST0xFX1VTRVIiXSwianRpIjoiYzIyY2YzMDgtZTIyYi00YzNjLWI5MjctOTYwYzA2YmY1ZmU0IiwiY2xpZW50X2lkIjoid2ViX2FwcCIsInNjb3BlIjpbIm9wZW5pZCJdfQ.IAhE39GCqWRUuXdWy-raOcE9NYXRhGiqkeJH649501LeqNPH5HtRUNWmudVRgwT52Bj7HcbJapMLGetKIMEASqC1-WARfcZ_PR0r7Kfg3OlFALWOH_oVT5kvi2H-QCoSAF9mRYK6abCh_tPk5KryVB5c7YxTMIXDT2nTsSexD8eNQOMBWRCg0RaLHZ9bKfeyVgncQJsu7-vTo1xJyh-keYpdNZ0TA2SjYJgezmB7gwW1Kmc7_83htr8VycG7XA_PuD9--yRNlrN0LtNHEBqNypZsOe6NvpKiNlodFYHlsU1CaumzcF9U7dpVanjIUKJ5VRWVUlSFY6JJ755W29VCTw";
    private final String newRefreshTokenValue = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJ1c2VyIiwic2NvcGUiOlsib3BlbmlkIl0sImF0aSI6ImMyMmNmMzA4LWUyMmItNGMzYy1iOTI3LTk2MGMwNmJmNWZlNCIsImV4cCI6MTQ5Njg2ODU4MSwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIl0sImp0aSI6ImU4YmZhZWJlLWYzMDItNGNjZS1hZGY1LWQ4MzE5OWM1MjBlOSIsImNsaWVudF9pZCI6IndlYl9hcHAifQ.OemWBUfc-2rl4t4VVqolYxul3L527PbSbX2Xvo7oyy3Vy5nmmblqp4hVGdTEjivrlldGVQX03ERbrA-oFkpmfWbBzLvnKS6AUq1MGjut6dXZJeiEqNYmiAABn6jSgK26S0k6b2ADgmf7mxJO8EBypb5sT1DMAbY5cbOe7r4ZG7zMTVSvlvjHTXp_FM8Y9i6nehLD4XDYY57cb_ZA89vAXNzvTAjoopDliExgR0bApG6nvvDEhEYgTS65lccEQocoev6bISJ3RvNYNPJxWcNPftKDp4HrEt2E2WP28K5IivRtQgDQNlQeormf1tp6AG-Oj__NXyAPM7yhAKXNy2zWdQ";
    @Mock
    private RestTemplate restTemplate;
    @Mock
    private TokenStore tokenStore;
    private UaaAuthenticationService authenticationService;
    private RefreshTokenFilter refreshTokenFilter;

    @Before
    public void init() throws NoSuchMethodException {
        OAuth2CookieHelper cookieHelper = new OAuth2CookieHelper();
        DefaultOAuth2AccessToken accessToken = new DefaultOAuth2AccessToken(accessTokenValue);
        DefaultOAuth2RefreshToken refreshToken = new DefaultOAuth2RefreshToken(refreshTokenValue);
        accessToken.setRefreshToken(refreshToken);

        mockPasswordGrant(accessToken);
        mockRefreshGrant();

        authenticationService = new UaaAuthenticationService(cookieHelper, restTemplate);
        when(tokenStore.readAccessToken(accessTokenValue)).thenReturn(accessToken);
        refreshTokenFilter = new RefreshTokenFilter(authenticationService, tokenStore);
    }

    private void mockPasswordGrant(OAuth2AccessToken accessToken) {
        HttpHeaders reqHeaders = new HttpHeaders();
        reqHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        reqHeaders.add("Authorization", CLIENT_AUTHORIZATION);                //take over Authorization header from client request to UAA request
        MultiValueMap<String, String> formParams = new LinkedMultiValueMap<>();
        formParams.set("username", "user");
        formParams.set("password", "user");
        formParams.add("grant_type", "password");
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formParams, reqHeaders);
        when(restTemplate.postForEntity("http://uaa/oauth/token", entity, OAuth2AccessToken.class))
            .thenReturn(new ResponseEntity<OAuth2AccessToken>(accessToken, HttpStatus.OK));
    }

    private void mockRefreshGrant() {
        DefaultOAuth2AccessToken newAccessToken = new DefaultOAuth2AccessToken(newAccessTokenValue);
        DefaultOAuth2RefreshToken newRefreshToken = new DefaultOAuth2RefreshToken(newRefreshTokenValue);
        newAccessToken.setRefreshToken(newRefreshToken);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "refresh_token");
        params.add("refresh_token", refreshTokenValue);
        params.add("client_id", "web_app");
        //we must authenticate with the UAA server via HTTP basic authentication using the browser's client_id with no client secret
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", CLIENT_AUTHORIZATION);
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);
        when(restTemplate.postForEntity("http://uaa/oauth/token", entity, OAuth2AccessToken.class))
            .thenReturn(new ResponseEntity<OAuth2AccessToken>(newAccessToken, HttpStatus.OK));
    }

    @Test
    public void testAuthenticationCookies() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.setServerName("www.test.com");
        request.addHeader("Authorization", CLIENT_AUTHORIZATION);
        Map<String, String> params = new HashMap<>();
        params.put("username", "user");
        params.put("password", "user");
        params.put("rememberMe", "true");
        authenticationService.authenticate(request, response, params);
        //check that cookies are set correctly
        Cookie accessTokenCookie = response.getCookie(OAuth2CookieHelper.ACCESS_TOKEN_COOKIE);
        Assert.assertEquals(accessTokenValue, accessTokenCookie.getValue());
        Cookie refreshTokenCookie = response.getCookie(OAuth2CookieHelper.SESSION_REFRESH_TOKEN_COOKIE);
        Assert.assertEquals(refreshTokenValue, refreshTokenCookie.getValue());
        Cookie clientAuthorizationCookie = response.getCookie(OAuth2CookieHelper.CLIENT_AUTHORIZATION_COOKIE);
        Assert.assertEquals(CLIENT_AUTHORIZATION, clientAuthorizationCookie.getValue());
    }

    @Test
    public void testRefreshGrant() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        Cookie accessTokenCookie = new Cookie(OAuth2CookieHelper.ACCESS_TOKEN_COOKIE, accessTokenValue);
        Cookie refreshTokenCookie = new Cookie(OAuth2CookieHelper.SESSION_REFRESH_TOKEN_COOKIE, refreshTokenValue);
        request.setCookies(accessTokenCookie, refreshTokenCookie);
        MockHttpServletResponse response = new MockHttpServletResponse();
        HttpServletRequest newRequest = refreshTokenFilter.refreshTokensIfExpiring(request, response);
        Cookie newAccessTokenCookie = response.getCookie(OAuth2CookieHelper.ACCESS_TOKEN_COOKIE);
        Assert.assertEquals(newAccessTokenValue, newAccessTokenCookie.getValue());
        Cookie newRefreshTokenCookie = response.getCookie(OAuth2CookieHelper.SESSION_REFRESH_TOKEN_COOKIE);
        Assert.assertEquals(newRefreshTokenValue, newRefreshTokenCookie.getValue());
        Cookie requestAccessTokenCookie = OAuth2CookieHelper.getAccessTokenCookie(newRequest);
        Assert.assertEquals(newAccessTokenValue, requestAccessTokenCookie.getValue());
    }

    @Test
    public void testLogout() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        Cookie accessTokenCookie = new Cookie(OAuth2CookieHelper.ACCESS_TOKEN_COOKIE, accessTokenValue);
        Cookie refreshTokenCookie = new Cookie(OAuth2CookieHelper.SESSION_REFRESH_TOKEN_COOKIE, refreshTokenValue);
        request.setCookies(accessTokenCookie, refreshTokenCookie);
        MockHttpServletResponse response = new MockHttpServletResponse();
        authenticationService.logout(request, response);
        Cookie newAccessTokenCookie = response.getCookie(OAuth2CookieHelper.ACCESS_TOKEN_COOKIE);
        Assert.assertEquals(0, newAccessTokenCookie.getMaxAge());
        Cookie newRefreshTokenCookie = response.getCookie(OAuth2CookieHelper.SESSION_REFRESH_TOKEN_COOKIE);
        Assert.assertEquals(0, newRefreshTokenCookie.getMaxAge());
    }
}
