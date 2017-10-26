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
package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
<%_ if (authenticationType === 'uaa') { _%>

import <%=packageName%>.security.oauth2.OAuth2AuthenticationService;
<%_ } _%>
import <%=packageName%>.security.SecurityUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
<%_ if (authenticationType === 'uaa') { _%>
import org.springframework.http.MediaType;
<%_ } _%>
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
<%_ if (authenticationType === 'uaa') { _%>
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.web.bind.annotation.RequestBody;
<%_ } _%>
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
<%_ if (authenticationType === 'uaa') { _%>
import javax.servlet.http.HttpServletResponse;
import java.util.Map;
<%_ } _%>

<%_ if (authenticationType === 'uaa') { _%>
/**
 * Authentication endpoint for web client.
 * Used to authenticate a user using OAuth2 access tokens or log him out.
 */
@RestController
@RequestMapping("/auth")
public class AuthResource {

    private final Logger log = LoggerFactory.getLogger(AuthResource.class);

    private OAuth2AuthenticationService authenticationService;

    public AuthResource(OAuth2AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    /**
     * Authenticates a user setting the access and refresh token cookies.
     *
     * @param request  the HttpServletRequest holding - among others - the headers passed from the client.
     * @param response the HttpServletResponse getting the cookies set upon successful authentication.
     * @param params   the login params (username, password, rememberMe).
     * @return the access token of the authenticated user. Will return an error code if it fails to authenticate the user.
     */
    @RequestMapping(value = "/login", method = RequestMethod.POST, consumes = MediaType
        .APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<OAuth2AccessToken> authenticate(HttpServletRequest request, HttpServletResponse response, @RequestBody
        Map<String, String> params) {
        return authenticationService.authenticate(request, response, params);
    }

    /**
     * Logout current user deleting his cookies.
     *
     * @param request the HttpServletRequest holding - among others - the headers passed from the client.
     * @param response the HttpServletResponse getting the cookies set upon successful authentication.
     * @return an empty response entity.
     */
    @RequestMapping(value = "/logout", method = RequestMethod.POST)
    @Timed
    public ResponseEntity logout(HttpServletRequest request, HttpServletResponse response) {
        log.debug("logging out user {}", SecurityUtils.getCurrentUserLogin());
        authenticationService.logout(request, response);
        return new ResponseEntity<>(HttpStatus.OK);
    }
<%_ } _%>
<%_ if (authenticationType === 'oauth2') { _%>
@RestController
@RequestMapping("/api")
public class AuthResource {

    private final Logger log = LoggerFactory.getLogger(AuthResource.class);

    /**
     * Logout the current user.
     */
    @RequestMapping(value = "/logout", method = RequestMethod.POST)
    @Timed
    public ResponseEntity logout(HttpServletRequest request) {
        log.debug("logging out user {}", SecurityUtils.getCurrentUserLogin());
        request.getSession().invalidate();
        return new ResponseEntity<>(HttpStatus.OK);
    }
<%_ } _%>
}
