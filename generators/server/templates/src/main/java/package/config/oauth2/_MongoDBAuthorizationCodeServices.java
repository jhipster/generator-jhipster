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
package <%=packageName%>.config.oauth2;

import <%=packageName%>.domain.OAuth2AuthenticationCode;
import <%=packageName%>.repository.OAuth2CodeRepository;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.code.RandomValueAuthorizationCodeServices;

public class MongoDBAuthorizationCodeServices extends RandomValueAuthorizationCodeServices {

    private final OAuth2CodeRepository oAuth2CodeRepository;

    public MongoDBAuthorizationCodeServices(OAuth2CodeRepository oAuth2CodeRepository) {
        this.oAuth2CodeRepository = oAuth2CodeRepository;
    }

    @Override
    protected void store(String code, OAuth2Authentication authentication) {
        this.oAuth2CodeRepository.save( new OAuth2AuthenticationCode(code, authentication) );
    }

    public OAuth2Authentication remove(String code) {
        OAuth2AuthenticationCode oAuth2AuthenticationCode = oAuth2CodeRepository.findOneByCode(code);
        if (oAuth2AuthenticationCode != null && oAuth2AuthenticationCode.getAuthentication() != null) {
            oAuth2CodeRepository.delete(oAuth2AuthenticationCode);
            return oAuth2AuthenticationCode.getAuthentication();
        }
        return null;
    }
}
