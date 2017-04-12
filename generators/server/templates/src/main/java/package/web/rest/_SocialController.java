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
package <%=packageName%>.web.rest;

import <%=packageName%>.service.SocialService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.social.connect.Connection;
import org.springframework.social.connect.web.ProviderSignInUtils;
import org.springframework.social.support.URIBuilder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/social")
public class SocialController {

    private final Logger log = LoggerFactory.getLogger(SocialController.class);

    private final SocialService socialService;

    private final ProviderSignInUtils providerSignInUtils;

    public SocialController(SocialService socialService, ProviderSignInUtils providerSignInUtils) {
        this.socialService = socialService;
        this.providerSignInUtils = providerSignInUtils;
    }

    @GetMapping("/signup")
    public RedirectView signUp(WebRequest webRequest, @CookieValue(name = "NG_TRANSLATE_LANG_KEY", required = false, defaultValue = "\"<%= nativeLanguage %>\"") String langKey) {
        try {
            Connection<?> connection = providerSignInUtils.getConnectionFromSession(webRequest);
            socialService.createSocialUser(connection, langKey.replace("\"", ""));
            return new RedirectView(URIBuilder.fromUri("/#/social-register/" + connection.getKey().getProviderId())
                .queryParam("success", "true")
                .build().toString(), true);
        } catch (Exception e) {
            log.error("Exception creating social user: ", e);
            return new RedirectView(URIBuilder.fromUri("/#/social-register/no-provider")
                .queryParam("success", "false")
                .build().toString(), true);
        }
    }
}
