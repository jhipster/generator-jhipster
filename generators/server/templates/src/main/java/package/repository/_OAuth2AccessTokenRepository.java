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
package <%=packageName%>.repository;

import <%=packageName%>.domain.OAuth2AuthenticationAccessToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * Spring Data MongoDB repository for the OAuth2AuthenticationAccessToken entity.
 */
public interface OAuth2AccessTokenRepository extends MongoRepository<OAuth2AuthenticationAccessToken, String> {

    OAuth2AuthenticationAccessToken findByTokenId(String tokenId);

    OAuth2AuthenticationAccessToken findByRefreshToken(String refreshToken);

    OAuth2AuthenticationAccessToken findByAuthenticationId(String authenticationId);

    List<OAuth2AuthenticationAccessToken> findByClientIdAndUserName(String clientId, String userName);

    List<OAuth2AuthenticationAccessToken> findByClientId(String clientId);
}
